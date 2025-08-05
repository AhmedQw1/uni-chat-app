import { useEffect } from 'react';
import { initializeGroup } from '../../firebase';
import { majors, generalGroups, generalCourses } from '../../data/majors';

export default function GroupInitializer() {
  useEffect(() => {
    const initializeAllGroups = async () => {
      console.log("Starting group initialization...");
      
      // Helper function to normalize ID creation
      const normalizeId = (text) => text.toLowerCase().replace(/\s+/g, '-');
      
      // Initialize major groups
      for (const major of majors) {
        const groupId = normalizeId(major);
        await initializeGroup(groupId, major, 'major');
      }
      
      // Initialize general groups
      for (const group of generalGroups) {
        const groupId = normalizeId(group);
        await initializeGroup(groupId, group, 'general');
      }
      
      // Initialize course groups
      for (const course of generalCourses) {
        const groupId = normalizeId(course);
        await initializeGroup(groupId, course, 'course');
      }
      
      console.log("All groups initialized");
    };
    
    initializeAllGroups();
  }, []);
  
  return null; // This component doesn't render anything
}