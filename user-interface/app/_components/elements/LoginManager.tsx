'use client';
import { useCallback, useState } from 'react';
import type { UserData } from '../types/UserData';
import { Button, Text } from '@fluentui/react-components';

export default function LoginManager() {
	const [user, setUser] = useState<UserData | null>(null);

	const fetchUserData = useCallback((): UserData => {
		const mock: UserData = {
			id: '123',
			name: 'Jane Doe',
			email: 'jane.doe@example.com',
		};
		setUser(mock);
		return mock;
	}, []);

	return (
		<div>
			<Button onClick={() => fetchUserData()}>Fetch User Data</Button>
			{user && (
				<div>
					<Text>ID: {user.id}</Text>
					<Text>Name: {user.name}</Text>
					<Text>Email: {user.email}</Text>
				</div>
			)}
		</div>
	);
}

