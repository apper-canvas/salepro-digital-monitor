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
import contactService from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
const [formData, setFormData] = useState({
    first_name_c: "",
    last_name_c: "",
    email_c: "",
    phone_c: "",
    company_c: "",
    job_title_c: "",
    account_id_c: "",
    relationship_level_c: "Decision Maker",
    notes_c: ""
  });

  const relationships = ["All", "Decision Maker", "Influencer", "Champion", "Technical Evaluator", "Contact"];

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
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
      relationship_level_c: "Decision Maker",
      notes_c: ""
    });
    setSelectedContact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        await contactService.update(selectedContact.Id, formData);
        toast.success("Contact updated successfully!");
      } else {
        await contactService.create(formData);
        toast.success("Contact created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadContacts();
    } catch (err) {
      toast.error("Failed to save contact. Please try again.");
    }
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
first_name_c: contact.first_name_c,
      last_name_c: contact.last_name_c,
      email_c: contact.email_c,
      phone_c: contact.phone_c,
      company_c: contact.company_c,
      job_title_c: contact.job_title_c,
      account_id_c: contact.account_id_c,
      relationship_level_c: contact.relationship_level_c,
      notes_c: contact.notes_c || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId);
        toast.success("Contact deleted successfully!");
        loadContacts();
      } catch (err) {
        toast.error("Failed to delete contact. Please try again.");
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
const matchesSearch = 
      contact.first_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company_c?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = selectedRelationship === "All" || contact.relationship_level_c === selectedRelationship;
    return matchesSearch && matchesRelationship;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadContacts} /></Layout>;

  return (
    <Layout title="Contacts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search contacts..."
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
            Add Contact
          </Button>
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <Empty
            title="No contacts found"
            description="Build your contact database by adding your first contact."
            icon="Users"
            action={{
              label: "Add Contact",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
          <div className="grid gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.Id} className="hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-success-100 p-2 rounded-full">
                          <ApperIcon name="User" className="h-5 w-5 text-success-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
{contact.first_name_c} {contact.last_name_c}
                          </h3>
                          <p className="text-sm text-gray-500">{contact.job_title_c} at {contact.company_c}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Mail" className="inline h-4 w-4 mr-2" />
{contact.email_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Phone" className="inline h-4 w-4 mr-2" />
{contact.phone_c}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Building" className="inline h-4 w-4 mr-2" />
Account ID: {contact.account_id_c}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Calendar" className="inline h-4 w-4 mr-2" />
Last: {format(new Date(contact.last_interaction_c), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

{contact.notes_c && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{contact.notes_c}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <Badge 
                          variant={
contact.relationship_level_c === "Decision Maker" ? "success" :
                            contact.relationshipLevel === "Champion" ? "primary" :
                            contact.relationshipLevel === "Influencer" ? "warning" : "default"
                          }
                        >
{contact.relationship_level_c}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contact.Id)}
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
          title={selectedContact ? "Edit Contact" : "Add New Contact"}
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
                  {relationships.slice(1).map(relationship => (
                    <option key={relationship} value={relationship}>{relationship}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Notes">
<textarea
                value={formData.notes_c}
                onChange={(e) => setFormData({...formData, notes_c: e.target.value})}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes about this contact..."
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
                {selectedContact ? "Update Contact" : "Create Contact"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Contacts;