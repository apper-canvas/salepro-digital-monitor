import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import clientService from "@/services/api/clientService";
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

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
first_name_c: "",
    last_name_c: "",
    email_c: "",
    phone_c: "",
    company_c: "",
    job_title_c: "",
    account_id_c: "",
    relationship_level_c: "Champion",
    notes_c: ""
  });

  const relationships = ["All", "Decision Maker", "Influencer", "Champion", "Technical Evaluator", "Contact"];

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const resetForm = () => {
setFormData({
      first_name_c: "",
      last_name_c: "",
      email_c: "",
      phone_c: "",
      company_c: "",
      job_title_c: "",
      account_id_c: "",
      relationship_level_c: "Champion",
      notes_c: ""
    });
    setSelectedClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.Id, formData);
        toast.success("Client updated successfully!");
      } else {
        await clientService.create(formData);
        toast.success("Client created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadClients();
    } catch (err) {
      toast.error("Failed to save client. Please try again.");
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
first_name_c: client.first_name_c,
      last_name_c: client.last_name_c,
      email_c: client.email_c,
      phone_c: client.phone_c,
      company_c: client.company_c,
      job_title_c: client.job_title_c,
      account_id_c: client.account_id_c,
      relationship_level_c: client.relationship_level_c,
      notes_c: client.notes_c || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientService.delete(clientId);
        toast.success("Client deleted successfully!");
        loadClients();
      } catch (err) {
        toast.error("Failed to delete client. Please try again.");
      }
    }
  };

  const filteredClients = clients.filter(client => {
const matchesSearch = 
      client.first_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_c?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = selectedRelationship === "All" || client.relationship_level_c === selectedRelationship;
    return matchesSearch && matchesRelationship;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadClients} /></Layout>;

  return (
    <Layout title="Clients">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search clients..."
              className="w-full sm:w-80"
            />
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {relationships.map(relationship => (
                <option key={relationship} value={relationship}>{relationship}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <Empty
            title="No clients found"
            description="Build your client database by adding your first client."
            icon="Users"
            action={{
              label: "Add Client",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
          <div className="grid gap-6">
            {filteredClients.map((client) => (
              <Card key={client.Id} className="hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-primary-100 p-2 rounded-full">
                          <ApperIcon name="UserCheck" className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
{client.first_name_c} {client.last_name_c}
                          </h3>
                          <p className="text-sm text-gray-500">{client.job_title_c} at {client.company_c}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Mail" className="inline h-4 w-4 mr-2" />
{client.email_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Phone" className="inline h-4 w-4 mr-2" />
{client.phone_c}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Building" className="inline h-4 w-4 mr-2" />
Account ID: {client.account_id_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
<ApperIcon name="Calendar" className="inline h-4 w-4 mr-2" />
                            Last: {client.last_interaction_c ? format(new Date(client.last_interaction_c), "MMM d, yyyy") : "Never"}
                          </p>
                        </div>
                      </div>

{client.notes_c && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{client.notes_c}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <Badge 
                          variant={
client.relationship_level_c === "Decision Maker" ? "success" :
                            client.relationship_level_c === "Champion" ? "primary" :
                            client.relationship_level_c === "Influencer" ? "warning" : "default"
                          }
                        >
                          {client.relationship_level_c}
                        </Badge>
                        <Badge variant="success">
                          <ApperIcon name="CheckCircle" className="h-3 w-3 mr-1" />
                          Client
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(client.Id)}
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
          title={selectedClient ? "Edit Client" : "Add New Client"}
          size="lg"
        >
<form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                value={formData.first_name_c}
                onChange={(e) => setFormData({...formData, first_name_c: e.target.value})}
                required
                placeholder="Enter first name"
              />
              <FormField
                label="Last Name"
                value={formData.last_name_c}
                onChange={(e) => setFormData({...formData, last_name_c: e.target.value})}
                required
                placeholder="Enter last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email"
                type="email"
                value={formData.email_c}
                onChange={(e) => setFormData({...formData, email_c: e.target.value})}
                required
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
                value={formData.company_c}
                onChange={(e) => setFormData({...formData, company_c: e.target.value})}
                required
                placeholder="Enter company name"
              />
              <FormField
                label="Job Title"
                value={formData.job_title_c}
                onChange={(e) => setFormData({...formData, job_title_c: e.target.value})}
                placeholder="Enter job title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Account ID"
                value={formData.account_id_c}
                onChange={(e) => setFormData({...formData, account_id_c: e.target.value})}
                placeholder="Enter account ID"
              />
              <FormField label="Relationship Level">
                <select
                  value={formData.relationship_level_c}
                  onChange={(e) => setFormData({...formData, relationship_level_c: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Champion">Champion</option>
                  <option value="Decision Maker">Decision Maker</option>
                  <option value="Influencer">Influencer</option>
                  <option value="Technical Evaluator">Technical Evaluator</option>
                </select>
              </FormField>
            </div>
            
            <FormField label="Notes">
              <textarea
                value={formData.notes_c}
                onChange={(e) => setFormData({...formData, notes_c: e.target.value})}
                className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-vertical"
                placeholder="Enter notes about this client..."
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
                {selectedClient ? "Update Client" : "Create Client"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Clients;