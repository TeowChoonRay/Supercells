export async function searchCompany(companyName: string) {
  try {
    const response = await fetch('/api/company/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyName }),
    });

    if (!response.ok) {
      throw new Error('Failed to search company');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching company:', error);
    throw error;
  }
}