// Utils/Store.js
import { proxy } from "valtio";

const state = proxy({
  currentUser: null,
  profileModalOpend: false,
  storyCards: [],
  createPostModalOpened: false,
  posts: [],
  users: [],
  selectedPost: null,
  updatePostModalOpened: false,
  activeIndex: 1,
  selectedUserProfile: null,
  friendProfileModalOpened: false,
  
  // Skill Plan section
  skillPlans: [],
  createSkillPlanOpened: false,
  updateSkillPlanOpened: false,
  selectedSkillPlanToUpdate: null,
  
  // New filter state
  skillPlanFilters: {
    level: null,       // 'beginner', 'intermediate', 'advanced'
    status: 'all'      // 'all', 'completed', 'in-progress'
  }
});

export default state;