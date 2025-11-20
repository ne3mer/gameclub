import type { FilterQuery } from 'mongoose';
import { OrderModel, type OrderDocument, type PaymentStatus, type FulfillmentStatus } from '../models/order.model';
import { CartModel } from '../models/cart.model';

interface CreateOrderInput {
  userId?: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  items: Array<{
    gameId: string;
    variantId?: string;
    selectedOptions?: Record<string, string>;
    pricePaid: number;
    quantity: number;
  }>;
  totalAmount: number;
}

export const createOrder = async (input: CreateOrderInput): Promise<OrderDocument> => {
  const orderData: any = {
    customerInfo: input.customerInfo,
    items: input.items.map(item => ({
      gameId: item.gameId,
      variantId: item.variantId,
      selectedOptions: item.selectedOptions ? new Map(Object.entries(item.selectedOptions)) : undefined,
      pricePaid: item.pricePaid,
      quantity: item.quantity
    })),
    totalAmount: input.totalAmount,
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending'
  };

  if (input.userId) {
    orderData.userId = input.userId;
  }

  const order = await OrderModel.create(orderData);

  // Clear user's cart after order creation
  if (input.userId) {
    await CartModel.findOneAndUpdate(
      { userId: input.userId },
      { $set: { items: [] } }
    );
  }

  return order;
};

export const getUserOrders = async (userId: string, status?: string): Promise<OrderDocument[]> => {
  const query: any = { userId };
  if (status) {
    query.paymentStatus = status;
  }

  return OrderModel.find(query)
    .populate('items.gameId')
    .sort({ createdAt: -1 });
};

export const getOrdersByCustomer = async (email: string, phone: string): Promise<OrderDocument[]> => {
  return OrderModel.find({
    'customerInfo.email': email,
    'customerInfo.phone': phone
  })
    .populate('items.gameId')
    .sort({ createdAt: -1 });
};

export const getOrderById = async (orderId: string, userId?: string): Promise<OrderDocument | null> => {
  const order = await OrderModel.findById(orderId).populate('items.gameId');
  
  if (!order) return null;
  
  // If order has a userId, verify it matches the requesting user
  if (order.userId && userId && order.userId.toString() !== userId) {
    return null;
  }
  
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  updates: {
    paymentStatus?: 'pending' | 'paid' | 'failed';
    fulfillmentStatus?: 'pending' | 'assigned' | 'delivered' | 'refunded';
    paymentReference?: string;
  }
): Promise<OrderDocument | null> => {
  return OrderModel.findByIdAndUpdate(
    orderId,
    { $set: updates },
    { new: true }
  ).populate('items.gameId');
};

export const getAllOrders = async (): Promise<OrderDocument[]> => {
  return OrderModel.find()
    .populate('items.gameId')
    .populate('userId')
    .sort({ createdAt: -1 });
};

export interface AdminOrderFilters {
  search?: string;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export const searchAdminOrders = async (filters: AdminOrderFilters) => {
  const query: FilterQuery<OrderDocument> = {};
  const andConditions: FilterQuery<OrderDocument>[] = [];

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    andConditions.push({
      $or: [
        { orderNumber: regex },
        { 'customerInfo.name': regex },
        { 'customerInfo.email': regex },
        { 'customerInfo.phone': regex }
      ]
    });
  }

  if (filters.paymentStatus) {
    andConditions.push({ paymentStatus: filters.paymentStatus });
  }

  if (filters.fulfillmentStatus) {
    andConditions.push({ fulfillmentStatus: filters.fulfillmentStatus });
  }

  if (filters.fromDate || filters.toDate) {
    const range: Record<string, Date> = {};
    if (filters.fromDate) {
      range.$gte = filters.fromDate;
    }
    if (filters.toDate) {
      range.$lte = filters.toDate;
    }
    andConditions.push({ createdAt: range });
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .populate('items.gameId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(query)
  ]);

  return { orders, total };
};

export const notifyCustomerByEmail = async (
  orderId: string,
  payload: { subject?: string; message: string }
) => {
  const order = await OrderModel.findById(orderId).populate('items.gameId');

  if (!order) {
    return null;
  }

  const subject = payload.subject?.trim() || `رسید سفارش ${order.orderNumber}`;
  const greeting = order.customerInfo.name ? `سلام ${order.customerInfo.name}` : 'سلام همراه GameClub';
  const summaryLines = order.items
    .map(
      (item) =>
        `• ${item.quantity}× ${(item.gameId as any)?.title ?? 'بازی'} (${item.pricePaid.toLocaleString('fa-IR')} تومان)`
    )
    .join('\n');

  const compiledMessage =
    payload.message?.trim() ||
    `${greeting}

سفارش شماره ${order.orderNumber} با مبلغ ${order.totalAmount.toLocaleString('fa-IR')} تومان ثبت شده است.
جزئیات اقلام:
${summaryLines}

وضعیت پرداخت: ${order.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
وضعیت تحویل: ${order.fulfillmentStatus}

با تشکر از خرید شما؛ تیم GameClub`;

  // Placeholder for integration with actual mail service
  console.info('[Order Email Simulation]', {
    to: order.customerInfo.email,
    subject,
    message: compiledMessage
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    to: order.customerInfo.email,
    subject,
    message: compiledMessage
  };
};

export const updateOrderDelivery = async (
  orderId: string,
  payload: {
    message?: string;
    credentials?: string;
    deliveredAt?: Date;
    updatedBy?: string;
  }
) => {
  const update: Record<string, unknown> = {};
  if (payload.message !== undefined) {
    update['deliveryInfo.message'] = payload.message;
  }
  if (payload.credentials !== undefined) {
    update['deliveryInfo.credentials'] = payload.credentials;
  }
  update['deliveryInfo.deliveredAt'] = payload.deliveredAt ?? new Date();
  if (payload.updatedBy) {
    update['deliveryInfo.updatedBy'] = payload.updatedBy;
  }

  return OrderModel.findByIdAndUpdate(orderId, { $set: update }, { new: true })
    .populate('items.gameId')
    .populate('userId');
};

export const acknowledgeOrderDelivery = async (orderId: string, userId: string) => {
  return OrderModel.findOneAndUpdate(
    { _id: orderId, userId },
    {
      $set: {
        customerAcknowledgement: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      }
    },
    { new: true }
  );
};
