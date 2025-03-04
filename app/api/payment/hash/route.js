// app/api/payment/hash/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, txnid } = body;

    // Get PayUMoney credentials
    const payumoneyDoc = await getDoc(doc(db, 'paymentGateways', 'payumoney'));
    if (!payumoneyDoc.exists()) {
      throw new Error('PayUMoney settings not found');
    }

    const { merchantKey, saltKey } = payumoneyDoc.data().credentials;

    // Generate hash
    const hashString = `${merchantKey}|${txnid}|${amount}|product_info|customer_name|customer_email|||||||||||${saltKey}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return NextResponse.json({ hash });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}