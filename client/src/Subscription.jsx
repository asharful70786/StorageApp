import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "./api/subscriptionApi";

// Lucide Icons
import {
  Play,
  Pause,
  X,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  CheckCircle,
  Crown,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    if (message) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadSubscription = async () => {
    try {
      const data = await fetchSubscriptions();
      if (Array.isArray(data) && data.length > 0) {
        setSubscription(data[0]);
      } else {
        setMessage("No active subscription found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to load subscription details.");
    }
  };

  const handleAction = async (action, actionFunction, successMessage) => {
    if (!subscription) return;
    
    if (action === "cancel" && !window.confirm("Are you sure you want to cancel this subscription?")) return;
    
    try {
      setLoading(true);
      await actionFunction(subscription.razorpaySubscriptionId);
      setMessage(successMessage);
      await loadSubscription();
    } catch (err) {
      console.error(err);
      setMessage(`Failed to ${action} subscription.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => 
    handleAction("pause", pauseSubscription, "Subscription paused successfully");
  
  const handleResume = () => 
    handleAction("resume", resumeSubscription, "Subscription resumed successfully");
  
  const handleCancel = () => 
    handleAction("cancel", cancelSubscription, "Subscription cancellation requested");

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">{message || "Loading your subscription..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-['Inter']">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your plan and billing</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
        <Link to="/" >HOME</Link>
          </button>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Pro Plan
                </div>
              </div>

              {/* Plan Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pro Plan</h2>
                    <p className="text-gray-500">Full access to all features</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    subscription.status === "active" 
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : subscription.status === "paused"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </div>
                </div>
              </div>

           

              {/* Features List */}
            

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {subscription.status === "active" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePause}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
                  >
                    <Pause className="w-4 h-4" />
                    {loading ? "Processing..." : "Pause Plan"}
                  </motion.button>
                )}

                {subscription.status === "paused" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResume}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    {loading ? "Processing..." : "Resume Plan"}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-red-500  transition-all duration-200 disabled:opacity-50 font-medium shadow-sm ml-auto"
                >
                  <X className="w-4 h-4" />
                  Cancel Plan
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Billing Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                Billing Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">SUBSCRIPTION ID</div>
                  <div className="text-gray-900 font-mono">
                    {subscription.razorpaySubscriptionId.slice(-8)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">STARTED</div>
                  <div className="text-gray-900">
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">BILLING CYCLE</div>
                  <div className="text-gray-900">Monthly</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-medium mb-1">NEXT BILLING</div>
                  <div className="text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Need help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Our support team is here to help you with any questions
              </p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-gray-800 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg border border-gray-700">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Subscription;