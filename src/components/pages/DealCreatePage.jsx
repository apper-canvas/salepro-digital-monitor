import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import salesTeamService from "@/services/api/salesTeamService";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Layout from "@/components/organisms/Layout";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const stages = ["All", "New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const productOptions = [
  "SaaS License",
  "Professional Services",
  "Training",
  "Support Package",
  "Custom Development",
  "Integration Services"
];

function DealCreatePage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
const [loading, setLoading] = useState(true);
  const [salesTeams, setSalesTeams] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    accountId: "",
    value: "",
    probability: 50,
    stage: "New",
    expectedCloseDate: "",
    notes: "",
products: [],
    salesTeam: ""
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
const [contactsData, salesTeamsData] = await Promise.all([
        contactService.getAll(),
        salesTeamService.getAll()
      ]);
      setContacts(contactsData);
      setSalesTeams(salesTeamsData);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate account ID when contact is selected
  const handleContactChange = (contactId) => {
    const selectedContact = contacts.find(contact => contact.Id === parseInt(contactId));
    setFormData({
      ...formData,
      contactId,
      accountId: selectedContact ? selectedContact.company : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Deal title is required");
      return;
    }
    
    if (!formData.contactId) {
      toast.error("Please select a contact");
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error("Please enter a valid deal value");
      return;
    }
    
    if (!formData.expectedCloseDate) {
      toast.error("Expected close date is required");
      return;
    }

    try {
      setSaving(true);
const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        contactId: parseInt(formData.contactId),
        sales_team_c: parseInt(formData.salesTeam)
      };
      await dealService.create(dealData);
      toast.success("Deal created successfully!");
      navigate('/deals');
    } catch (err) {
      toast.error("Failed to create deal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/deals');
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <Error message={error} onRetry={loadContacts} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
          </div>
          <p className="text-gray-600">
            Create a new deal by linking it to a contact, setting the value and close date, and adding it to your pipeline.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Deal Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter deal title (e.g., 'Q1 Software License Deal')"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Contact" required>
                <select
                  required
                  value={formData.contactId}
                  onChange={(e) => handleContactChange(e.target.value)}
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
                placeholder="Account will auto-populate from contact"
              />
</div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Team *
              </label>
              <select
                value={formData.salesTeam}
                onChange={(e) => setFormData({...formData, salesTeam: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a sales team</option>
                {salesTeams.map((team) => (
                  <option key={team.Id} value={team.Id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Deal Value ($)"
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              <FormField label="Win Probability (%)">
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

              <FormField label="Pipeline Stage">
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

            <FormField label="Products/Services">
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

            <FormField label="Deal Notes">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes about this deal, next steps, or important details..."
                rows={4}
                className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </FormField>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="min-w-32"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Create Deal
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default DealCreatePage;