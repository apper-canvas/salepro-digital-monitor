import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Layout from "@/components/organisms/Layout";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const handleCardClick = (deal) => {
    handleEdit(deal);
  };
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    accountId: "",
    value: "",
    probability: 50,
    stage: "New",
    expectedCloseDate: "",
    notes: "",
    products: []
  });

  const stages = ["All", "New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const productOptions = [
    "Basic CRM",
    "Standard CRM",
    "Enterprise CRM",
    "Advanced Analytics",
    "API Integration",
    "Inventory Module",
    "Reporting Suite",
    "Compliance Module",
    "Training Package",
    "Custom Development"
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      contactId: "",
      accountId: "",
      value: "",
      probability: 50,
      stage: "New",
      expectedCloseDate: "",
      notes: "",
      products: []
    });
    setSelectedDeal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 50
      };

      if (selectedDeal) {
        await dealService.update(selectedDeal.Id, dealData);
        toast.success("Deal updated successfully!");
      } else {
        await dealService.create(dealData);
        toast.success("Deal created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save deal. Please try again.");
    }
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      contactId: deal.contactId,
      accountId: deal.accountId,
      value: deal.value.toString(),
      probability: deal.probability,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : "",
      notes: deal.notes || "",
      products: deal.products || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(dealId);
        toast.success("Deal deleted successfully!");
        loadData();
      } catch (err) {
        toast.error("Failed to delete deal. Please try again.");
      }
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

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactName(deal.contactId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactCompany(deal.contactId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === "All" || deal.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadData} /></Layout>;

  return (
    <Layout title="Deals">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search deals..."
              className="w-full sm:w-80"
            />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
</div>
          <Button onClick={() => navigate('/deals/new')}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>

        {/* Deals List */}
        {filteredDeals.length === 0 ? (
          <Empty
            title="No deals found"
            description="Start building your sales pipeline by creating your first deal."
            icon="Handshake"
            action={{
              label: "Create Deal",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
<div className="grid gap-6">
            {filteredDeals.map((deal) => (
              <Card
                key={deal.Id} 
                hover={true}
                onClick={() => handleCardClick(deal)}
                className="hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-success-100 p-2 rounded-full">
                          <ApperIcon name="Handshake" className="h-5 w-5 text-success-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                          <p className="text-sm text-gray-500">
                            {getContactName(deal.contactId)} at {getContactCompany(deal.contactId)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${deal.value.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Probability</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 rounded-full h-2 transition-all duration-300"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {deal.probability}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Expected Close</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={deal.stage.toLowerCase().replace(" ", "")}>
                            {deal.stage}
                          </Badge>
                          <Badge variant={
                            deal.status === "Open" ? "primary" : 
                            deal.status === "Won" ? "success" : "error"
                          }>
                            {deal.status}
                          </Badge>
                        </div>
                        
                        {deal.actualCloseDate && (
                          <p className="text-xs text-gray-400">
                            Closed: {format(new Date(deal.actualCloseDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>

                      {deal.products && deal.products.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Products</p>
                          <div className="flex flex-wrap gap-1">
                            {deal.products.map((product, index) => (
                              <Badge key={index} variant="default" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {deal.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{deal.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(deal)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal.Id)}
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
          title={selectedDeal ? "Edit Deal" : "Create New Deal"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormField
              label="Deal Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter deal title"
            />
{/* PLACEHOLDER - Need more context to determine correct JSX element */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Contact">
                <select
                  required
                  value={formData.contactId}
                  onChange={(e) => {
                    const contactId = e.target.value;
                    const selectedContact = contacts.find(contact => contact.Id === parseInt(contactId));
                    setFormData({
                      ...formData, 
                      contactId,
                      accountId: selectedContact ? selectedContact.company : formData.accountId
                    });
                  }}
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

              <FormField
                label="Account/Company"
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                placeholder="Auto-populated from contact"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Deal Value ($)"
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="0.00"
              />

              <FormField label="Probability (%)">
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center text-sm font-medium text-gray-900">
                    {formData.probability}%
                  </div>
                </div>
              </FormField>

              <FormField label="Stage">
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {stages.slice(1).map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Expected Close Date"
              type="date"
              required
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
            />

            <FormField label="Products">
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {productOptions.map(product => (
                  <label key={product} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.products.includes(product)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            products: [...formData.products, product]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            products: formData.products.filter(p => p !== product)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{product}</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes about this deal..."
                rows={3}
                className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </FormField>

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
                {selectedDeal ? "Update Deal" : "Create Deal"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Deals;