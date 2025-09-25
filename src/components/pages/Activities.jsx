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
import activityService from "@/services/api/activityService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    type: "Call",
    contactId: "",
    dealId: "",
    subject: "",
    description: "",
    date: "",
    duration: "",
    outcome: "Pending"
  });

  const types = ["All", "Call", "Meeting", "Email", "Task"];
  const outcomes = ["Pending", "Positive", "Neutral", "Negative", "Completed"];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      type: "Call",
      contactId: "",
      dealId: "",
      subject: "",
      description: "",
      date: new Date().toISOString().slice(0, 16),
      duration: "",
      outcome: "Pending"
    });
    setSelectedActivity(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        duration: parseInt(formData.duration) || 0
      };

      if (selectedActivity) {
        await activityService.update(selectedActivity.Id, activityData);
        toast.success("Activity updated successfully!");
      } else {
        await activityService.create(activityData);
        toast.success("Activity created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save activity. Please try again.");
    }
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      type: activity.type,
      contactId: activity.contactId,
      dealId: activity.dealId || "",
      subject: activity.subject,
      description: activity.description,
      date: new Date(activity.date).toISOString().slice(0, 16),
      duration: activity.duration.toString(),
      outcome: activity.outcome
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.delete(activityId);
        toast.success("Activity deleted successfully!");
        loadData();
      } catch (err) {
        toast.error("Failed to delete activity. Please try again.");
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

  const getDealTitle = (dealId) => {
    if (!dealId) return "";
    const deal = deals.find(d => d.Id === parseInt(dealId));
    return deal ? deal.title : "";
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      "Call": "Phone",
      "Meeting": "Calendar",
      "Email": "Mail",
      "Task": "CheckSquare"
    };
    return iconMap[type] || "Calendar";
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactName(activity.contactId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || activity.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadData} /></Layout>;

  return (
    <Layout title="Activities">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search activities..."
              className="w-full sm:w-80"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </div>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <Empty
            title="No activities found"
            description="Start tracking your customer interactions by logging your first activity."
            icon="Calendar"
            action={{
              label: "Log Activity",
              onClick: () => {
                resetForm();
                setIsModalOpen(true);
              },
              icon: "Plus"
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Activity Timeline */}
            <div className="relative">
              {filteredActivities.map((activity, index) => (
                <div key={activity.Id} className="relative">
                  {/* Timeline line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-20 bg-gray-200" />
                  )}
                  
                  <Card className="ml-14 hover:shadow-lg transition-all duration-200">
                    <div className="p-6">
                      <div className="absolute -left-8 top-6 bg-white border-4 border-gray-200 rounded-full p-2">
                        <div className={`p-2 rounded-full ${
                          activity.type === "Call" ? "bg-blue-100" :
                          activity.type === "Meeting" ? "bg-green-100" :
                          activity.type === "Email" ? "bg-yellow-100" : "bg-purple-100"
                        }`}>
                          <ApperIcon 
                            name={getActivityIcon(activity.type)} 
                            className={`h-4 w-4 ${
                              activity.type === "Call" ? "text-blue-600" :
                              activity.type === "Meeting" ? "text-green-600" :
                              activity.type === "Email" ? "text-yellow-600" : "text-purple-600"
                            }`} 
                          />
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{activity.subject}</h3>
                            <Badge variant={activity.type.toLowerCase()}>
                              {activity.type}
                            </Badge>
                            <Badge variant={activity.outcome.toLowerCase()}>
                              {activity.outcome}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                <ApperIcon name="User" className="inline h-4 w-4 mr-2" />
                                {getContactName(activity.contactId)} at {getContactCompany(activity.contactId)}
                              </p>
                              {activity.dealId && getDealTitle(activity.dealId) && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <ApperIcon name="Handshake" className="inline h-4 w-4 mr-2" />
                                  Deal: {getDealTitle(activity.dealId)}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <ApperIcon name="Clock" className="inline h-4 w-4 mr-2" />
                                {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                              {activity.duration > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <ApperIcon name="Timer" className="inline h-4 w-4 mr-2" />
                                  Duration: {activity.duration} minutes
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(activity)}
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(activity.Id)}
                            className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={selectedActivity ? "Edit Activity" : "Log New Activity"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Activity Type">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {types.slice(1).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Outcome">
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                  className="flex w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {outcomes.map(outcome => (
                    <option key={outcome} value={outcome}>{outcome}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Enter activity subject"
            />

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
                label="Date & Time"
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />

              <FormField
                label="Duration (minutes)"
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="0"
              />
            </div>

            <FormField label="Description">
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what happened during this activity..."
                rows={4}
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
                {selectedActivity ? "Update Activity" : "Log Activity"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Activities;