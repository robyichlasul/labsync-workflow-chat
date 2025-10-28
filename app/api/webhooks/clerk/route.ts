import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase';
import { users } from '@/db/schema/labsync';
import { eq } from 'drizzle-orm';
import { db } from '@/db';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret!);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err: any) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';

    if (!email) {
      return new NextResponse('No email found for user', { status: 400 });
    }

    try {
      // Insert user into Supabase
      await db.insert(users).values({
        id: id,
        email: email,
        name: name,
        avatar: image_url || null,
        role: 'staff', // Default role
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`User ${id} synced to Supabase successfully`);
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
      return new NextResponse('Error syncing user to database', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';

    try {
      // Update user in Supabase
      await db
        .update(users)
        .set({
          email: email,
          name: name,
          avatar: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      console.log(`User ${id} updated in Supabase successfully`);
    } catch (error) {
      console.error('Error updating user in Supabase:', error);
      return new NextResponse('Error updating user in database', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Soft delete user in Supabase
      await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      console.log(`User ${id} soft deleted in Supabase successfully`);
    } catch (error) {
      console.error('Error soft deleting user in Supabase:', error);
      return new NextResponse('Error deleting user in database', { status: 500 });
    }
  }

  return new NextResponse('Webhook processed', { status: 200 });
}