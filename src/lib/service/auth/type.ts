export enum UserRole {
  Admin = 0,
  Instructor = 1,
  Student = 2,
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  isVerified: boolean;
  role: UserRole;
  bio?: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface Wallet {
  walletId: string;
  userId: string;
  balance: number;
}

export enum TransactionType {
  Deposit = 0,
  Withdrawal = 1,
  Earnings = 2,
}

export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
}

export interface WalletTransaction {
  walletTransactionId: string;
  walletId: string;
  paymentId?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  description?: string;
}

export interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderName?: string;
  receiverName?: string;
}
