import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import invoiceService from "@/services/api/invoiceService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    contactId: "",
    dealId: "",
    dueDate: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: "", total: 0 }],
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: "Draft"
  });

  const statuses = ["All", "Draft", "Pending", "Paid", "Overdue"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [invoicesData, contactsData, dealsData] = await Promise.all([
        invoiceService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setInvoices(invoicesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      contactId: "",
      dealId: "",
      dueDate: "",
      lineItems: [{ description: "", quantity: 1, unitPrice: "", total: 0 }],
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      status: "Draft"
    });
    setSelectedInvoice(null);
  };

  const calculateTotals = (lineItems) => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = subtotal * 0.08; // 8% tax rate
    const totalAmount = subtotal + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate total for this line item
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const unitPrice = field === "unitPrice" ? parseFloat(value) || 0 : updatedItems[index].unitPrice;
      updatedItems[index].total = quantity * unitPrice;
    }

    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
    calculateTotals(updatedItems);
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unitPrice: "", total: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    const updatedItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
    calculateTotals(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (selectedInvoice) {
        await invoiceService.update(selectedInvoice.Id, invoiceData);
        toast.success("Invoice updated successfully!");
      } else {
        await invoiceService.create(invoiceData);
        toast.success("Invoice created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      contactId: invoice.contactId,
      dealId: invoice.dealId || "",
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : "",
      lineItems: invoice.lineItems || [{ description: "", quantity: 1, unitPrice: "", total: 0 }],
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      status: invoice.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoiceService.delete(invoiceId);
        toast.success("Invoice deleted successfully!");
        loadData();
      } catch (err) {
        toast.error("Failed to delete invoice. Please try again.");
      }
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === "Paid") {
        updateData.paymentDate = new Date().toISOString();
      }
      
      await invoiceService.update(invoiceId, updateData);
      toast.success(`Invoice marked as ${newStatus.toLowerCase()}!`);
      loadData();
    } catch (err) {
      toast.error("Failed to update invoice status. Please try again.");
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === parseInt(contactId));
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getContactCompany = (contactId) => {
    const contact = contacts.find(c => c.Id === parseInt(contactId));
    return contact ? contact.company : "Unknown Company";
  };

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === parseInt(dealId));
    return deal ? deal.title : "";
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactName(invoice.contactId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactCompany(invoice.contactId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadData} /></Layout>;

  return (
    <Layout title="Invoices">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search invoices..."
              className="w-full sm:w-80"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <Empty
            title="No invoices found"
            description="Create your first invoice to start tracking payments."
            icon="FileText"
            action={{
              label: "Create Invoice",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.Id} className="hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-warning-100 p-2 rounded-full">
                          <ApperIcon name="FileText" className="h-5 w-5 text-warning-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-500">
                            {getContactName(invoice.contactId)} at {getContactCompany(invoice.contactId)}
                          </p>
                          {invoice.dealId && getDealTitle(invoice.dealId) && (
                            <p className="text-xs text-gray-400">
                              Deal: {getDealTitle(invoice.dealId)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${invoice.subtotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Tax</p>
                          <p className="text-lg font-medium text-gray-900">
                            ${invoice.taxAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                          <p className="text-xs text-primary-600 mb-1">Total Amount</p>
                          <p className="text-xl font-bold text-primary-900">
                            ${invoice.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Due Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={invoice.status.toLowerCase()}>
                            {invoice.status}
                          </Badge>
                          <select
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(invoice.Id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        </div>
                        
                        <div className="text-right text-xs text-gray-400">
                          <p>Issued: {format(new Date(invoice.issueDate), "MMM d, yyyy")}</p>
                          {invoice.paymentDate && (
                            <p>Paid: {format(new Date(invoice.paymentDate), "MMM d, yyyy")}</p>
                          )}
                        </div>
                      </div>

                      {invoice.lineItems && invoice.lineItems.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-xs text-gray-500 mb-2">Line Items</p>
                          <div className="space-y-1">
                            {invoice.lineItems.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.quantity}x {item.description}
                                </span>
                                <span className="font-medium text-gray-900">
                                  ${item.total.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {invoice.lineItems.length > 3 && (
                              <p className="text-xs text-gray-400">
                                +{invoice.lineItems.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(invoice.Id)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedInvoice ? "Edit Invoice" : "Create New Invoice"}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Contact">
                <select
                  required
                  value={formData.contactId}
                  onChange={(e) => setFormData({...formData, contactId: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select contact</option>
                  {contacts.map(contact => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.firstName} {contact.lastName} - {contact.company}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Related Deal (Optional)">
                <select
                  value={formData.dealId}
                  onChange={(e) => setFormData({...formData, dealId: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select deal (optional)</option>
                  {deals.map(deal => (
                    <option key={deal.Id} value={deal.Id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Due Date"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />

              <FormField label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </FormField>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Line Items</h4>
                <Button type="button" variant="secondary" size="sm" onClick={addLineItem}>
                  <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {formData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                      className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                      className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                      className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-10 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-medium">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50 w-full"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span className="font-medium">${formData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${formData.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedInvoice ? "Update Invoice" : "Create Invoice"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Invoices;