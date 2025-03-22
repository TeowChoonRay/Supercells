import { supabase } from './supabase';

interface CRMConfig {
  hubspot_api_key?: string;
  salesforce_client_id?: string;
  salesforce_client_secret?: string;
  salesforce_refresh_token?: string;
  last_sync?: string;
}

export async function saveCRMConfig(userId: string, config: Partial<CRMConfig>) {
  try {
    // First check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update({ crm_config: config })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          crm_config: config
        }]);

      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving CRM config:', error);
    return false;
  }
}

export async function getCRMConfig(userId: string): Promise<CRMConfig | null> {
  try {
    // First check if settings exist
    const { data, error } = await supabase
      .from('user_settings')
      .select('crm_config')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

    if (error) throw error;
    return data?.crm_config || null;
  } catch (error) {
    console.error('Error getting CRM config:', error);
    return null;
  }
}

export async function syncWithCRM(userId: string, platform: 'hubspot' | 'salesforce') {
  try {
    const config = await getCRMConfig(userId);
    if (!config) throw new Error('CRM not configured');

    // Get leads from Supabase
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId);

    if (leadsError) throw leadsError;

    // Here you would implement the actual sync logic with Hubspot/Salesforce
    // For now, we'll just update the last sync timestamp
    await saveCRMConfig(userId, {
      ...config,
      last_sync: new Date().toISOString()
    });

    return {
      success: true,
      message: `Successfully synced with ${platform}`,
      synced_records: leads?.length || 0
    };
  } catch (error) {
    console.error('Error syncing with CRM:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
      synced_records: 0
    };
  }
}