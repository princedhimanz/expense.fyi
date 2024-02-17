import { headers } from 'next/headers';

import { WebhookEvent } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { Webhook } from 'svix';

import prisma from 'lib/prisma';

export async function POST(req: Request) {
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
	}

	// Get the headers
	const headerPayload = headers();
	const svixId = headerPayload.get('svix-id');
	const svixTimestamp = headerPayload.get('svix-timestamp');
	const svixSignature = headerPayload.get('svix-signature');

	// If there are no headers, error out
	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response('Error occurred -- no svix headers', {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Error verifying webhook:', err);
		return new Response('Error occured', {
			status: 400,
		});
	}

	// Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
	console.log('Webhook body:', body);

	if (eventType === 'user.created') {
		const { first_name, last_name, email_addresses, id: userId } = evt.data;
		const email = email_addresses[0].email_address;
		const name = `${first_name} ${last_name}`;

		const uuid = randomUUID();

		try {
			await prisma.users.create({
				data: {
					id: uuid,
					email,
					clerk_id: userId,
				},
			});

			console.log(`New user ${name} with email ${email} created`);
		} catch (error) {
			console.error('Error creating user:', error);
		}
	}

	return new Response('', { status: 200 });
}
