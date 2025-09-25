import { toast } from 'react-toastify';

class InvoiceService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'invoice_c';
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
          {"field": {"Name": "invoice_number_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "line_items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_amount_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "payment_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching invoices:", response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching invoices:", error?.response?.data?.message || error);
      toast.error("Failed to fetch invoices");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "invoice_number_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "line_items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_amount_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "payment_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error("Error fetching invoice:", response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice:", error?.response?.data?.message || error);
      return null;
    }
  }

  async create(invoiceData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Only include updateable fields
      const createData = {
        Name: invoiceNumber,
        invoice_number_c: invoiceNumber,
        contact_id_c: parseInt(invoiceData.contact_id_c),
        deal_id_c: invoiceData.deal_id_c ? parseInt(invoiceData.deal_id_c) : null,
        issue_date_c: new Date().toISOString(),
        due_date_c: invoiceData.due_date_c,
        line_items_c: JSON.stringify(invoiceData.line_items_c || []),
        subtotal_c: parseFloat(invoiceData.subtotal_c) || 0,
        tax_amount_c: parseFloat(invoiceData.tax_amount_c) || 0,
        total_amount_c: parseFloat(invoiceData.total_amount_c) || 0,
        status_c: invoiceData.status_c || "Draft",
        payment_date_c: invoiceData.payment_date_c || null
      };

      const params = {
        records: [createData]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating invoice:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} invoices:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Invoice created successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating invoice:", error?.response?.data?.message || error);
      toast.error("Failed to create invoice");
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
      if (updateData.invoice_number_c !== undefined) {
        updatePayload.invoice_number_c = updateData.invoice_number_c;
        updatePayload.Name = updateData.invoice_number_c;
      }
      if (updateData.contact_id_c !== undefined) updatePayload.contact_id_c = parseInt(updateData.contact_id_c);
      if (updateData.deal_id_c !== undefined) updatePayload.deal_id_c = updateData.deal_id_c ? parseInt(updateData.deal_id_c) : null;
      if (updateData.issue_date_c !== undefined) updatePayload.issue_date_c = updateData.issue_date_c;
      if (updateData.due_date_c !== undefined) updatePayload.due_date_c = updateData.due_date_c;
      if (updateData.line_items_c !== undefined) updatePayload.line_items_c = JSON.stringify(updateData.line_items_c);
      if (updateData.subtotal_c !== undefined) updatePayload.subtotal_c = parseFloat(updateData.subtotal_c);
      if (updateData.tax_amount_c !== undefined) updatePayload.tax_amount_c = parseFloat(updateData.tax_amount_c);
      if (updateData.total_amount_c !== undefined) updatePayload.total_amount_c = parseFloat(updateData.total_amount_c);
      if (updateData.status_c !== undefined) updatePayload.status_c = updateData.status_c;
      if (updateData.payment_date_c !== undefined) updatePayload.payment_date_c = updateData.payment_date_c;

      const params = {
        records: [updatePayload]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error updating invoice:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} invoices:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Invoice updated successfully!");
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating invoice:", error?.response?.data?.message || error);
      toast.error("Failed to update invoice");
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
        console.error("Error deleting invoice:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} invoices:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success("Invoice deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting invoice:", error?.response?.data?.message || error);
      toast.error("Failed to delete invoice");
      return false;
    }
  }

  async getByStatus(status) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "invoice_number_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "line_items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_amount_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "payment_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [status], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching invoices by status:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching invoices by status:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByContact(contactId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "invoice_number_c"}},
          {"field": {"Name": "issue_date_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "line_items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_amount_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "payment_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [
          {"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)], "Include": true}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching invoices by contact:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching invoices by contact:", error?.response?.data?.message || error);
      return [];
    }
  }
}
export default new InvoiceService();