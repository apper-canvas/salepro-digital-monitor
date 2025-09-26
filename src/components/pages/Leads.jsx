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
import leadService from "@/services/api/leadService";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
first_name_c: "",
    last_name_c: "",
    email_c: "",
    phone_c: "",
    company_c: "",
    job_title_c: "",
    industry_c: "",
    lead_source_c: "",
    status_c: "New"
  });

const statuses = ["All", "New", "Contacted", "Qualified", "Unqualified", "Completed"];
  const leadSources = ["Website", "LinkedIn", "Referral", "Trade Show", "Cold Call", "Email"];
  const industries = ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education"];

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await leadService.getAll();
      setLeads(data);
    } catch (err) {
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const resetForm = () => {
setFormData({
      first_name_c: "",
      last_name_c: "",
      email_c: "",
      phone_c: "",
      company_c: "",
      job_title_c: "",
      industry_c: "",
      lead_source_c: "",
      status_c: "New"
    });
    setSelectedLead(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await leadService.update(selectedLead.Id, formData);
        toast.success("Lead updated successfully!");
      } else {
        await leadService.create(formData);
        toast.success("Lead created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadLeads();
    } catch (err) {
      toast.error("Failed to save lead. Please try again.");
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setFormData({
first_name_c: lead.first_name_c,
      last_name_c: lead.last_name_c,
      email_c: lead.email_c,
      phone_c: lead.phone_c,
      company_c: lead.company_c,
      job_title_c: lead.job_title_c,
      industry_c: lead.industry_c,
      lead_source_c: lead.lead_source_c,
      status_c: lead.status_c
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadService.delete(leadId);
        toast.success("Lead deleted successfully!");
        loadLeads();
      } catch (err) {
        toast.error("Failed to delete lead. Please try again.");
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
const matchesSearch = 
      lead.first_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_c?.toLowerCase().includes(searchTerm.toLowerCase());
const matchesStatus = selectedStatus === "All" || lead.status_c === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadLeads} /></Layout>;

  return (
    <Layout title="Leads">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search leads..."
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
            Add Lead
          </Button>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <Empty
            title="No leads found"
            description="Start building your sales pipeline by adding your first lead."
            icon="UserPlus"
            action={{
              label: "Add Lead",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
          <div className="grid gap-6">
            {filteredLeads.map((lead) => (
              <Card key={lead.Id} className="hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-primary-100 p-2 rounded-full">
                          <ApperIcon name="User" className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
{lead.first_name_c} {lead.last_name_c}
                          </h3>
                          <p className="text-sm text-gray-500">{lead.job_title_c} at {lead.company_c}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Mail" className="inline h-4 w-4 mr-2" />
{lead.email_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Phone" className="inline h-4 w-4 mr-2" />
{lead.phone_c}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Building" className="inline h-4 w-4 mr-2" />
{lead.industry_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Target" className="inline h-4 w-4 mr-2" />
{lead.lead_source_c}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
<Badge variant={lead.status_c ? lead.status_c.toLowerCase() : 'default'}>
                            {lead.status_c}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Star" className="h-4 w-4 text-warning-500" />
                            <span className="text-sm font-medium text-gray-700">
Score: {lead.score_c}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
Added {format(new Date(lead.created_date_c), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.Id)}
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
          title={selectedLead ? "Edit Lead" : "Add New Lead"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                required
value={formData.first_name_c}
                onChange={(e) => setFormData({...formData, first_name_c: e.target.value})}
                placeholder="Enter first name"
              />
              <FormField
                label="Last Name"
                required
value={formData.last_name_c}
                onChange={(e) => setFormData({...formData, last_name_c: e.target.value})}
                placeholder="Enter last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email"
                type="email"
                required
value={formData.email_c}
                onChange={(e) => setFormData({...formData, email_c: e.target.value})}
                placeholder="Enter email address"
              />
              <FormField
                label="Phone"
value={formData.phone_c}
                onChange={(e) => setFormData({...formData, phone_c: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company"
                required
value={formData.company_c}
                onChange={(e) => setFormData({...formData, company_c: e.target.value})}
                placeholder="Enter company name"
              />
              <FormField
                label="Job Title"
                value={formData.jobTitle}
onChange={(e) => setFormData({...formData, job_title_c: e.target.value})}
                placeholder="Enter job title"
                value={formData.job_title_c}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Industry">
                <select
value={formData.industry_c}
                  onChange={(e) => setFormData({...formData, industry_c: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Lead Source">
<select
                  value={formData.lead_source_c}
                  onChange={(e) => setFormData({...formData, lead_source_c: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select source</option>
                  {leadSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </FormField>

<FormField label="Status">
                <select
                  value={formData.status_c}
                  onChange={(e) => setFormData({...formData, status_c: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
<option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                  <option value="Completed">Completed</option>
                </select>
              </FormField>
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
                {selectedLead ? "Update Lead" : "Create Lead"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Leads;