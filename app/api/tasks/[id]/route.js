// /api/tasks   /[id]/route.js

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';

function toObjectId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}

async function resolveId(params) {
    const { id } = await params;
    const _id = toObjectId(id);
    if (!_id) return { _id: null, error: NextResponse.json({ error: 'Invalid id' }, { status: 400 }) };
    return { _id, error: null };
}

export async function GET(request, { params }) {
    const { _id, error } = await resolveId(params);
    if (error) return error;

    const tasks = await getCollection('tasks');
    const doc = await tasks.findOne({ _id });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(doc);
}

export async function PUT(request, { params }) {
    const { _id, error } = await resolveId(params);
    if (error) return error;

    const body = await request.json();
    delete body._id;

    const tasks = await getCollection('tasks');
    const updated = await tasks.findOneAndUpdate(
        { _id },
        { $set: body },
        { returnDocument: 'after' }
    );
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
    const { _id, error } = await resolveId(params);
    if (error) return error;

    const tasks = await getCollection('tasks');
    const { deletedCount } = await tasks.deleteOne({ _id });
    if (deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: _id.toString() });
}