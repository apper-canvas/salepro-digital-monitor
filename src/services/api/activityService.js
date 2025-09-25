import { toast } from 'react-toastify';

class ActivityService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'activity_c';
    this.initializeClient();
  }

  initializeClient() {
    if (window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching activities:", response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      toast.error("Failed to fetch activities");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching activity:", response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching activity:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(activityData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const createData = {
        Name: activityData.subject_c,
        type_c: activityData.type_c,
        contact_id_c: parseInt(activityData.contact_id_c),
        deal_id_c: activityData.deal_id_c ? parseInt(activityData.deal_id_c) : null,
        subject_c: activityData.subject_c,
        description_c: activityData.description_c,
        date_c: activityData.date_c,
        duration_c: parseInt(activityData.duration_c) || 0,
        outcome_c: activityData.outcome_c || "Pending"
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating activity:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Activity created successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      toast.error("Failed to create activity");
      return null;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const updatePayload = {
        Id: parseInt(id)
      };

      // Add only provided updateable fields
      if (updateData.type_c !== undefined) updatePayload.type_c = updateData.type_c;
      if (updateData.contact_id_c !== undefined) updatePayload.contact_id_c = parseInt(updateData.contact_id_c);
      if (updateData.deal_id_c !== undefined) updatePayload.deal_id_c = updateData.deal_id_c ? parseInt(updateData.deal_id_c) : null;
      if (updateData.subject_c !== undefined) {
        updatePayload.subject_c = updateData.subject_c;
        updatePayload.Name = updateData.subject_c;
      }
      if (updateData.description_c !== undefined) updatePayload.description_c = updateData.description_c;
      if (updateData.date_c !== undefined) updatePayload.date_c = updateData.date_c;
      if (updateData.duration_c !== undefined) updatePayload.duration_c = parseInt(updateData.duration_c);
      if (updateData.outcome_c !== undefined) updatePayload.outcome_c = updateData.outcome_c;

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating activity:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Activity updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      toast.error("Failed to update activity");
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error deleting activity:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Activity deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      toast.error("Failed to delete activity");
      return false;
    }
  }

  async getByContact(contactId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [
          {"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)], "Include": true}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching activities by contact:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByDeal(dealId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [
          {"FieldName": "deal_id_c", "Operator": "EqualTo", "Values": [parseInt(dealId)], "Include": true}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching activities by deal:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by deal:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByType(type) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [
          {"FieldName": "type_c", "Operator": "EqualTo", "Values": [type], "Include": true}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching activities by type:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by type:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new ActivityService();