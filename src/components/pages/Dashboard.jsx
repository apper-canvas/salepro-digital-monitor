import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/organisms/Layout";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import leadService from "@/services/api/leadService";
import dealService from "@/services/api/dealService";
import invoiceService from "@/services/api/invoiceService";
import activityService from "@/services/api/activityService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    leads: [],
    deals: [],
    invoices: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [leads, deals, invoices, activities] = await Promise.all([
        leadService.getAll(),
        dealService.getAll(),
        invoiceService.getAll(),
        activityService.getAll()
      ]);

      setData({ leads, deals, invoices, activities });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><Error message={error} onRetry={loadDashboardData} /></Layout>;

  const totalLeads = data.leads.length;
  const qualifiedLeads = data.leads.filter(lead => lead.status === "Qualified").length;
  const totalDeals = data.deals.length;
  const openDeals = data.deals.filter(deal => deal.status === "Open").length;
  const totalRevenue = data.deals
    .filter(deal => deal.status === "Won")
    .reduce((sum, deal) => sum + deal.value, 0);
  const pendingInvoices = data.invoices.filter(invoice => invoice.status === "Pending").length;
  
  const recentActivities = data.activities.slice(0, 5);
  const upcomingDeals = data.deals
    .filter(deal => deal.status === "Open")
    .sort((a, b) => new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate))
    .slice(0, 5);

  const pipelineData = {
    "New": data.deals.filter(deal => deal.stage === "New").length,
    "Qualified": data.deals.filter(deal => deal.stage === "Qualified").length,
    "Proposal": data.deals.filter(deal => deal.stage === "Proposal").length,
    "Negotiation": data.deals.filter(deal => deal.stage === "Negotiation").length,
    "Closed Won": data.deals.filter(deal => deal.stage === "Closed Won").length
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-blue-700 rounded-xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to SalePro</h1>
              <p className="text-primary-100 text-lg">
                Manage your sales pipeline and customer relationships efficiently
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <ApperIcon name="BarChart3" className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={totalLeads.toLocaleString()}
            change={`${qualifiedLeads} qualified`}
            changeType="positive"
            icon="UserPlus"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Open Deals"
            value={openDeals.toLocaleString()}
            change={`${totalDeals} total`}
            changeType="neutral"
            icon="Handshake"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Revenue (Won)"
            value={`$${(totalRevenue / 1000).toFixed(0)}K`}
            change="+12.5% this month"
            changeType="positive"
            icon="DollarSign"
            iconBg="bg-success-100"
            iconColor="text-success-600"
          />
          <StatCard
            title="Pending Invoices"
            value={pendingInvoices.toLocaleString()}
            change="2 overdue"
            changeType="warning"
            icon="FileText"
            iconBg="bg-warning-100"
            iconColor="text-warning-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600" />
                  <span>Recent Activities</span>
                </Card.Title>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/activities")}
                >
                  View All
                  <ApperIcon name="ArrowRight" className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <ApperIcon 
                        name={activity.type === "Call" ? "Phone" : activity.type === "Meeting" ? "Calendar" : "Mail"} 
                        className="h-4 w-4 text-primary-600" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.subject}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={activity.type.toLowerCase()}>
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {format(new Date(activity.date), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Upcoming Deals */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="flex items-center space-x-2">
                  <ApperIcon name="Handshake" className="h-5 w-5 text-success-600" />
                  <span>Upcoming Deals</span>
                </Card.Title>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/deals")}
                >
                  View All
                  <ApperIcon name="ArrowRight" className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {upcomingDeals.map((deal) => (
                  <div key={deal.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{deal.title}</p>
                      <p className="text-sm text-gray-500">
                        Expected close: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={deal.stage.toLowerCase().replace(" ", "")}>
                          {deal.stage}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {deal.probability}% probability
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(deal.value / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Pipeline Overview */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <ApperIcon name="GitBranch" className="h-5 w-5 text-primary-600" />
              <span>Pipeline Overview</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(pipelineData).map(([stage, count]) => (
                <div key={stage} className="text-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{stage}</div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <ApperIcon name="Zap" className="h-5 w-5 text-primary-600" />
              <span>Quick Actions</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="primary"
                className="flex flex-col items-center space-y-2 h-20"
                onClick={() => navigate("/leads")}
              >
                <ApperIcon name="UserPlus" className="h-6 w-6" />
                <span>Add Lead</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center space-y-2 h-20"
                onClick={() => navigate("/deals")}
              >
                <ApperIcon name="Handshake" className="h-6 w-6" />
                <span>Create Deal</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center space-y-2 h-20"
                onClick={() => navigate("/contacts")}
              >
                <ApperIcon name="Users" className="h-6 w-6" />
                <span>Add Contact</span>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center space-y-2 h-20"
                onClick={() => navigate("/invoices")}
              >
                <ApperIcon name="FileText" className="h-6 w-6" />
                <span>New Invoice</span>
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;