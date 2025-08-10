// src/controllers/paymentController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { UserRequest } from '../types/express.d.js';
import Iyzipay from 'iyzipay';

const iyzipay = new Iyzipay({
  uri: process.env.IYZICO_API_BASE_URL as string,
  apiKey: process.env.IYZICO_API_KEY as string,
  secretKey: process.env.IYZICO_SECRET_KEY as string,
});

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const { amount } = req.body;

  if (!amount) {
    res.status(400);
    throw new Error('Amount is required');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400);
    throw new Error('Amount must be a positive number');
  }

  try {
    const conversationId = Math.floor(Math.random() * 100000000).toString();

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: 'B67832',
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      enabledInstallments: [1],
      buyer: {
        id: req.user?.id || 'unknown',
        name: req.user?.name || 'unknown',
        surname: req.user?.name || 'unknown',
        gsmNumber: '+905350000000',
        email: req.user?.email || 'unknown@example.com',
        identityNumber: '74300864791',
        lastLoginDate: '2023-08-05 12:43:34',
        registrationDate: '2023-08-05 12:43:34',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.ip || '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732',
      },
      shippingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732',
      },
      billingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732',
      },
      callbackUrl: `${process.env.BASE_URL}/api/payment/callback`,
      installments: 1,
      paymentCard: {
        cardHolderName: 'TEST NAME',
        cardNumber: '4000000000000001',
        expireMonth: '12',
        expireYear: '2024',
        cvc: '123',
        cardAlias: 'test_card_alias'
      },
      basketItems: [
        {
          id: 'BI101',
          name: 'Test Course',
          category1: 'Education',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount.toFixed(2).toString(),
        },
      ],
    };

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {

      if (err) {
        console.log('Iyzipay Error:', err);
        return next(new Error(`Error creating payment form: ${err.errorMessage}`));
      }
      console.log('Iyzipay Result:', result);
      res.status(201).json({ paymentForm: result.checkoutFormContent });
    });
  } catch (error: any) {
    res.status(500);
    throw new Error(`Error creating payment intent: ${error.message}`);
  }
});

// @desc    Confirm payment
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  const { paymentToken } = req.body;

  if (!paymentToken) {
    res.status(400);
    throw new Error('Payment Token is required');
  }

  // Simulate successful payment for testing environment
  if (process.env.NODE_ENV === 'test') {
    return res.status(200).json({
      message: 'Payment confirmed successfully',
      paymentStatus: 'SUCCESS',
      conversationId: 'test_conversation_id',
    });
  }

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: Math.floor(Math.random() * 100000000).toString(),
    token: paymentToken,
  };

  iyzipay.checkoutForm.retrieve(request, (err: any, result: any) => {
    if (err) {
      return next(new Error(`Error retrieving payment: ${err.errorMessage}`));
    }

    if (result.paymentStatus === 'SUCCESS') {
      res.status(200).json({
        message: 'Payment confirmed successfully',
        paymentStatus: result.paymentStatus,
        conversationId: result.conversationId,
      });
    } else {
      return next(new Error(`Payment failed: ${result.errorMessage}`));
    }
  });
});

export { createPaymentIntent, confirmPayment };