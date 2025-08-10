import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { majors, generalGroups, generalCourses } from '../data/majors';
import { generateGroupId } from '../utils/groupId';

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

        // Batch fetch all users once
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const counts = {};
        let totalUsers = 0;
        usersSnapshot.forEach(doc => {
          const major = doc.data().major;
          if (major) {
            counts[major] = (counts[major] || 0) + 1;
          }
          totalUsers += 1;
        });

        // Create a group for each major with real member counts
        const majorSpecificGroups = majors.map((major) => ({
          id: generateGroupId(major),
          name: major,
          type: 'major',
          members: counts[major] || 0
        }));

        // Create general groups - these could have all users as potential members
        const generalGroupsData = generalGroups.map(group => ({
          id: generateGroupId(group),
          name: group,
          type: 'general',
          members: totalUsers // All users can join general groups
        }));

        // Create course groups - these could also have all users as potential members
        const courseGroupsData = generalCourses.map(course => ({
          id: generateGroupId(course),
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