import React, { useEffect, useState } from "react";
import { 
  Avatar, 
  Empty, 
  Spin, 
  message, 
  Select, 
  Radio, 
  Space, 
  Button 
} from "antd";
import { FilterOutlined, CloseOutlined } from "@ant-design/icons";
import TobBox from "./TobBox";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
import SkillPlanService from "../../Services/SkillPlanService";
import StateDebugger from "./StateDebugger";

// Components
import MyPost from "./MyPost";
import FriendsPost from "./FriendsPost";
import CreateSkillPlanBox from "./CreateSkillPlanBox";
import SkillPlanCard from "./SkillPlanCard";
import FriendsSection from "./FriendsSection";
import Notifications from "./Notifications";
import LearningDashboard from "./LearningDashboard";
import MyLearning from "./MyLearning";

const { Option } = Select;

const CenterSection = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load posts for the feed
  useEffect(() => {
    PostService.getPosts()
      .then((result) => {
        const uniquePosts = [];
        const seenIds = new Set();
        
        result.forEach(post => {
          if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            uniquePosts.push(post);
          }
        });
        
        state.posts = uniquePosts;
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
      });
  }, []);

  // Load user-specific skill plans
  useEffect(() => {
    const loadUserSkillPlans = async () => {
      if (snap.activeIndex !== 2 || !snap.currentUser?.uid) return;

      try {
        setLoading(true);
        const userSkillPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser.uid);
        state.skillPlans = userSkillPlans;
      } catch (err) {
        console.error("Failed to fetch skill plans:", err);
        message.error("Failed to load your skill plans");
      } finally {
        setLoading(false);
      }
    };

    loadUserSkillPlans();
  }, [snap.activeIndex, snap.currentUser?.uid]);

  // Filter skill plans
  const filteredPlans = snap.skillPlans?.filter(plan => {
    const levelMatch = levelFilter === 'all' || plan.skillLevel === levelFilter;
    const statusMatch = statusFilter === 'all' || 
                       (statusFilter === 'completed' ? plan.isFinished : !plan.isFinished);
    
    return levelMatch && statusMatch;
  }) || [];

  return (
    <div className="center">
      <div className="profile-header">
        <Avatar
          onClick={() => {
            state.profileModalOpend = true;
          }}
          size={70}
          src={snap.currentUser?.image}
          className="profile-avatar"
        />
      </div>
      <TobBox />
      
      <div className="content-container">
        {snap.activeIndex === 1 && (
          <div className="feed-container">
            <div className="my-post">
              <MyPost />
            </div>           
            <div className="posts-list">
              {snap.posts.map((post, index) => (
                <div className="friends-post" key={post.id || index}>
                  <FriendsPost post={post} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {snap.activeIndex === 2 && (
          <div className="skill-container">
            <StateDebugger />
            <CreateSkillPlanBox />
            
            {/* Toggle Filters Button */}
            <div className="filter-toggle-container">
              <Button 
                type="text" 
                icon={showFilters ? <CloseOutlined /> : <FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-button"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Filter Section */}
            {showFilters && (
              <div className="skill-plan-filters">
                <Space size="middle" className="filter-controls">
                  <Select
                    value={levelFilter}
                    onChange={setLevelFilter}
                    style={{ width: 180 }}
                    className="level-filter"
                  >
                    <Option value="all">All Levels</Option>
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                  </Select>

                  <Radio.Group 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                    className="status-filter"
                  >
                    <Radio.Button value="all">All</Radio.Button>
                    <Radio.Button value="completed">Completed</Radio.Button>
                    <Radio.Button value="in-progress">In Progress</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
            )}
            
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : filteredPlans.length > 0 ? (
              <div className="plans-grid">
                {filteredPlans.map((plan) => (
                  <SkillPlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  snap.skillPlans?.length === 0 
                    ? "You haven't created any skill plans yet" 
                    : "No plans match your filters"
                } 
                className="no-plans-message"
              />
            )}
          </div>
        )}
        
        {snap.activeIndex === 3 && (
          <div className="notifications-container">
            <LearningDashboard />
            <MyLearning />
          </div>
        )}      
        
        {snap.activeIndex === 4 && (
          <div className="friends-container">
            <FriendsSection />
          </div>
        )}
        
        {snap.activeIndex === 5 && (
          <div className="notifications-container">
            <Notifications />
          </div>
        )}      
      </div>
    </div>
  );
};

export default CenterSection;