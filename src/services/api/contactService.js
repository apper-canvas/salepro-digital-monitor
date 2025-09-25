import { toast } from "react-toastify";
import React from "react";

class ContactService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'contact_c';
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching contacts:", response.message);
        toast.error(response.message);
        return [];
}
      
      // Transform database field names to UI-expected format
      const transformedData = (response.data || []).map(contact => ({
        ...contact,
        firstName: contact.first_name_c,
        lastName: contact.last_name_c,
        email: contact.email_c,
        phone: contact.phone_c,
        company: contact.company_c,
        jobTitle: contact.job_title_c,
        accountId: contact.account_id_c,
        relationshipLevel: contact.relationship_level_c,
        lastInteraction: contact.last_interaction_c,
        notes: contact.notes_c
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      toast.error("Failed to fetch contacts");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching contact:", response.message);
        return null;
}
      
      // Transform database field names to UI-expected format
      if (response.data) {
        const contact = response.data;
        return {
          ...contact,
          firstName: contact.first_name_c,
          lastName: contact.last_name_c,
          email: contact.email_c,
          phone: contact.phone_c,
          company: contact.company_c,
          jobTitle: contact.job_title_c,
          accountId: contact.account_id_c,
          relationshipLevel: contact.relationship_level_c,
          lastInteraction: contact.last_interaction_c,
          notes: contact.notes_c
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching contact:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(contactData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
const createData = {
        Name: `${contactData.first_name_c || contactData.firstName} ${contactData.last_name_c || contactData.lastName}`,
        first_name_c: contactData.first_name_c || contactData.firstName,
        last_name_c: contactData.last_name_c || contactData.lastName,
        email_c: contactData.email_c || contactData.email,
        phone_c: contactData.phone_c || contactData.phone,
        company_c: contactData.company_c || contactData.company,
        job_title_c: contactData.job_title_c || contactData.jobTitle,
        account_id_c: contactData.account_id_c || contactData.accountId,
        relationship_level_c: contactData.relationship_level_c || contactData.relationshipLevel || "Decision Maker",
        last_interaction_c: new Date().toISOString(),
        notes_c: contactData.notes_c || contactData.notes || ""
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating contact:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Contact created successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      toast.error("Failed to create contact");
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
// Handle both database field names and UI field names
      if (updateData.first_name_c !== undefined || updateData.firstName !== undefined) updatePayload.first_name_c = updateData.first_name_c || updateData.firstName;
      if (updateData.last_name_c !== undefined || updateData.lastName !== undefined) updatePayload.last_name_c = updateData.last_name_c || updateData.lastName;
      if (updateData.email_c !== undefined || updateData.email !== undefined) updatePayload.email_c = updateData.email_c || updateData.email;
      if (updateData.phone_c !== undefined || updateData.phone !== undefined) updatePayload.phone_c = updateData.phone_c || updateData.phone;
      if (updateData.company_c !== undefined || updateData.company !== undefined) updatePayload.company_c = updateData.company_c || updateData.company;
      if (updateData.job_title_c !== undefined || updateData.jobTitle !== undefined) updatePayload.job_title_c = updateData.job_title_c || updateData.jobTitle;
      if (updateData.account_id_c !== undefined || updateData.accountId !== undefined) updatePayload.account_id_c = updateData.account_id_c || updateData.accountId;
      if (updateData.relationship_level_c !== undefined || updateData.relationshipLevel !== undefined) updatePayload.relationship_level_c = updateData.relationship_level_c || updateData.relationshipLevel;
      if (updateData.last_interaction_c !== undefined || updateData.lastInteraction !== undefined) updatePayload.last_interaction_c = updateData.last_interaction_c || updateData.lastInteraction;
      if (updateData.notes_c !== undefined || updateData.notes !== undefined) updatePayload.notes_c = updateData.notes_c || updateData.notes;
      
      // Update Name if first/last name changed
      if ((updateData.first_name_c !== undefined || updateData.firstName !== undefined) || (updateData.last_name_c !== undefined || updateData.lastName !== undefined)) {
        const firstName = updateData.first_name_c || updateData.firstName || '';
        const lastName = updateData.last_name_c || updateData.lastName || '';
        updatePayload.Name = `${firstName} ${lastName}`.trim();
      }

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating contact:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Contact updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
      toast.error("Failed to update contact");
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
        console.error("Error deleting contact:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Contact deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      toast.error("Failed to delete contact");
      return false;
    }
  }

  async getByAccount(accountId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "job_title_c"}},
          {"field": {"Name": "account_id_c"}},
          {"field": {"Name": "relationship_level_c"}},
          {"field": {"Name": "last_interaction_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [
          {"FieldName": "account_id_c", "Operator": "EqualTo", "Values": [accountId], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching contacts by account:", response.message);
return [];
      }
      
      // Transform database field names to UI-expected format
      const transformedData = (response.data || []).map(contact => ({
        ...contact,
        firstName: contact.first_name_c,
        lastName: contact.last_name_c,
        email: contact.email_c,
        phone: contact.phone_c,
        company: contact.company_c,
        jobTitle: contact.job_title_c,
        accountId: contact.account_id_c,
        relationshipLevel: contact.relationship_level_c,
        lastInteraction: contact.last_interaction_c,
        notes: contact.notes_c
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching contacts by account:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new ContactService();