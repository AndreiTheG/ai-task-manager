// /api/tasks/route.js
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';

export async function GET() {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await getCollection('tasks');
    const all = await tasks.find({ userId: session.user.email }).toArray();
    return NextResponse.json(all);
}

export async function POST(request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const tasks = await getCollection('tasks');
    const { insertedId } = await tasks.insertOne(body);
    return NextResponse.json({ _id: insertedId, ...body }, { status: 201 });
}