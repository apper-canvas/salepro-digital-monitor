import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stages = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  
  const stageColors = {
    "New": "bg-blue-100 border-blue-200",
    "Qualified": "bg-green-100 border-green-200",
    "Proposal": "bg-yellow-100 border-yellow-200",
    "Negotiation": "bg-orange-100 border-orange-200",
    "Closed Won": "bg-success-100 border-success-200",
    "Closed Lost": "bg-error-100 border-error-200"
  };

  const loadPipelineData = async () => {
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
      setError("Failed to load pipeline data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const handleStageChange = async (dealId, newStage) => {
    try {
      const updateData = { stage: newStage };
      
      // If moving to Closed Won or Closed Lost, update status and actual close date
      if (newStage === "Closed Won") {
        updateData.status = "Won";
        updateData.actualCloseDate = new Date().toISOString();
      } else if (newStage === "Closed Lost") {
        updateData.status = "Lost";
        updateData.actualCloseDate = new Date().toISOString();
      } else if (newStage !== "Closed Won" && newStage !== "Closed Lost") {
        updateData.status = "Open";
        updateData.actualCloseDate = null;
      }

      await dealService.update(dealId, updateData);
      toast.success(`Deal moved to ${newStage} successfully!`);
      loadPipelineData();
    } catch (err) {
      toast.error("Failed to update deal stage. Please try again.");
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === parseInt(contactId));
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getStageDeals = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageValue = (stage) => {
    return getStageDeals(stage).reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadPipelineData} /></Layout>;

  const totalPipelineValue = deals
    .filter(deal => deal.status === "Open")
    .reduce((sum, deal) => sum + (deal.value * (deal.probability / 100)), 0);

  return (
    <Layout title="Sales Pipeline">
      <div className="space-y-6">
        {/* Pipeline Stats */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-blue-700 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pipeline Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-primary-100">
                <div>
                  <p className="text-sm">Total Deals</p>
                  <p className="text-2xl font-bold text-white">{deals.length}</p>
                </div>
                <div>
                  <p className="text-sm">Open Deals</p>
                  <p className="text-2xl font-bold text-white">
                    {deals.filter(d => d.status === "Open").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Pipeline Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${(totalPipelineValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-white">
                    ${deals.length > 0 ? (deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length / 1000).toFixed(0) : 0}K
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <ApperIcon name="GitBranch" className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        {deals.length === 0 ? (
          <Empty
            title="No deals in pipeline"
            description="Start building your sales pipeline by creating your first deal."
            icon="Handshake"
            action={{
              label: "Create Deal",
              onClick: () => window.location.href = "/deals",
              icon: "Plus"
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-full pb-4">
              {stages.map((stage) => {
                const stageDeals = getStageDeals(stage);
                const stageValue = getStageValue(stage);
                
                return (
                  <div key={stage} className="flex-shrink-0 w-80">
                    <div className={`rounded-lg border-2 ${stageColors[stage]} p-4 min-h-[600px]`}>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{stage}</h3>
                          <Badge 
                            variant={stage.toLowerCase().replace(" ", "")}
                            className="ml-2"
                          >
                            {stageDeals.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          ${(stageValue / 1000).toFixed(0)}K total value
                        </p>
                      </div>

                      <div className="space-y-3">
                        {stageDeals.map((deal) => (
                          <Card 
                            key={deal.Id} 
                            className="cursor-move hover:shadow-lg transition-all duration-200 bg-white"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                  {deal.title}
                                </h4>
                                <div className="flex items-center space-x-1 ml-2">
                                  <select
                                    value={deal.stage}
                                    onChange={(e) => handleStageChange(deal.Id, e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {stages.map(stageOption => (
                                      <option key={stageOption} value={stageOption}>
                                        {stageOption}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-2">
                                {getContactName(deal.contactId)}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">
                                  ${(deal.value / 1000).toFixed(0)}K
                                </span>
                                <span className="text-xs text-gray-500">
                                  {deal.probability}%
                                </span>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  Close: {format(new Date(deal.expectedCloseDate), "MMM d")}
                                </span>
                                <Badge 
                                  variant={deal.status === "Open" ? "primary" : deal.status === "Won" ? "success" : "error"}
                                  className="text-xs"
                                >
                                  {deal.status}
                                </Badge>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-2">
                                <div className="bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-primary-600 rounded-full h-1.5 transition-all duration-300"
                                    style={{ width: `${deal.probability}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}

                        {stageDeals.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <ApperIcon name="Folder" className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No deals in {stage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="Zap" className="h-5 w-5 text-primary-600 mr-2" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => window.location.href = "/deals"}
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = "/contacts"}
              >
                <ApperIcon name="Users" className="h-4 w-4 mr-2" />
                View Contacts
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = "/activities"}
              >
                <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Pipeline;