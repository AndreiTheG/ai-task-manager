// /api/tasks/route.js

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
    const tasks = await getCollection('tasks');
    const all = await tasks.find({}).toArray();
    return NextResponse.json(all);
}

export async function POST(request) {
    const body = await request.json();
    const tasks = await getCollection('tasks');
    const { insertedId } = await tasks.insertOne(body);
    return NextResponse.json({ _id: insertedId, ...body }, { status: 201 });
}