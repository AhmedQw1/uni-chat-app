import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { majors, generalGroups, generalCourses } from '../data/majors';

export default function useGroups(userMajor) {
  const [loading, setLoading] = useState(true);
  const [majorGroups, setMajorGroups] = useState([]);
  const [allGroups, setAllGroups] = useState({
    majorSpecific: [],
    general: [],
    courses: []
  });

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        
        // Helper function to get member count for a major
        const getMemberCount = async (majorName) => {
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('major', '==', majorName));
            const snapshot = await getCountFromServer(q);
            return snapshot.data().count;
          } catch (error) {
            console.error(`Error getting member count for ${majorName}:`, error);
            return 0;
          }
        };
        
        // Create a group for each major with real member counts
        const majorSpecificGroups = await Promise.all(
          majors.map(async (major) => ({
            id: major.replace(/\s+/g, '-').toLowerCase(),
            name: major,
            type: 'major',
            members: await getMemberCount(major)
          }))
        );
        
        // Create general groups - these could have all users as potential members
        const totalUsers = await (async () => {
          try {
            const usersRef = collection(db, 'users');
            const snapshot = await getCountFromServer(usersRef);
            return snapshot.data().count;
          } catch (error) {
            console.error('Error getting total user count:', error);
            return 0;
          }
        })();
        
        const generalGroupsData = generalGroups.map(group => ({
          id: group.replace(/\s+/g, '-').toLowerCase(),
          name: group,
          type: 'general',
          members: totalUsers // All users can join general groups
        }));
        
        // Create course groups - these could also have all users as potential members
        const courseGroupsData = generalCourses.map(course => ({
          id: course.replace(/\s+/g, '-').toLowerCase(),
          name: course,
          type: 'course',
          members: totalUsers // All users can join course groups
        }));
        
        setAllGroups({
          majorSpecific: majorSpecificGroups,
          general: generalGroupsData,
          courses: courseGroupsData
        });
        
        // Set user's major group
        if (userMajor) {
          const userMajorGroup = majorSpecificGroups.find(
            group => group.name === userMajor
          );
          if (userMajorGroup) {
            setMajorGroups([userMajorGroup]);
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGroups();
  }, [userMajor]);

  return { allGroups, majorGroups, loading };
}