export async function getAuthToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append('client_id', 'crash-game-client');
  params.append('grant_type', 'password');
  params.append('username', 'player');
  params.append('password', 'player123');

  const response = await fetch('http://localhost:8080/realms/crash-game/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate with Keycloak: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}
