// app/api/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validari
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii!' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parola trebuie să aibă minim 6 caractere!' },
        { status: 400 }
      );
    }

    const users = await getCollection('users');

    // Verificam daca emailul exista deja
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email-ul este deja folosit!' },
        { status: 409 }
      );
    }

    // Hash-uim parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salvam userul in MongoDB
    await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Cont creat cu succes!' },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Eroare de server!' },
      { status: 500 }
    );
  }
}