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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    accountId: "",
    relationshipLevel: "Contact",
    notes: ""
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
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      accountId: "",
      relationshipLevel: "Contact",
      notes: ""
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
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      jobTitle: contact.jobTitle,
      accountId: contact.accountId,
      relationshipLevel: contact.relationshipLevel,
      notes: contact.notes || ""
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
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = selectedRelationship === "All" || contact.relationshipLevel === selectedRelationship;
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
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{contact.jobTitle} at {contact.company}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Mail" className="inline h-4 w-4 mr-2" />
                            {contact.email}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Phone" className="inline h-4 w-4 mr-2" />
                            {contact.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <ApperIcon name="Building" className="inline h-4 w-4 mr-2" />
                            Account ID: {contact.accountId}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ApperIcon name="Calendar" className="inline h-4 w-4 mr-2" />
                            Last: {format(new Date(contact.lastInteraction), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      {contact.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{contact.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <Badge 
                          variant={
                            contact.relationshipLevel === "Decision Maker" ? "success" :
                            contact.relationshipLevel === "Champion" ? "primary" :
                            contact.relationshipLevel === "Influencer" ? "warning" : "default"
                          }
                        >
                          {contact.relationshipLevel}
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
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Enter first name"
              />
              <FormField
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Enter last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
              <FormField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company"
                required
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Enter company name"
              />
              <FormField
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                placeholder="Enter job title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Account ID"
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                placeholder="Enter account ID"
              />
              <FormField label="Relationship Level">
                <select
                  value={formData.relationshipLevel}
                  onChange={(e) => setFormData({...formData, relationshipLevel: e.target.value})}
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
                value={formData.notes}
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