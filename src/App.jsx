import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SubjectChecklist from './components/SubjectChecklist';
import ConfirmationModal from './components/ConfirmationModal';
// Ensure data.js is in src
import syllabusData from './data';
import { fireConfetti, generateId } from './utils';

const STORAGE_KEY = 'upsc_checklist_v2';
const STREAK_KEY = 'upsc_streak_v2';

function App() {
  const [appState, setAppState] = useState(() => loadState());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count": 0, "lastLogin": ""}');

    if (stored.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (stored.lastLogin === yesterday.toDateString()) {
        stored.count++;
      } else if (stored.lastLogin !== today && stored.lastLogin) {
        // Reset if missed a day, unless it's new
        stored.count = 1;
      } else if (!stored.lastLogin) {
        stored.count = 1;
      }
      stored.lastLogin = today;
      localStorage.setItem(STREAK_KEY, JSON.stringify(stored));
    }
    setStreak(stored.count);
  }, []);

  const updateTopic = (id, idx, val) => {
    setAppState(prev => {
      const stored = prev[id];
      // Normalize to new object structure { items: [], note: '' }
      let currentItems;
      let currentNote = '';

      if (!stored) {
        currentItems = [{ val: false, time: null }, { val: false, time: null }, { val: false, time: null }];
      } else if (Array.isArray(stored)) {
        // Backward compatibility for array
        currentItems = stored.length > 0 && typeof stored[0] === 'boolean'
          ? stored.map(b => ({ val: b, time: null }))
          : stored;
      } else {
        // New structure
        currentItems = stored.items;
        currentNote = stored.note;
      }

      const nextItems = [...currentItems];
      const timestamp = val ? new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
      }) : null;

      nextItems[idx] = { val, time: timestamp };

      return { ...prev, [id]: { items: nextItems, note: currentNote } };
    });
  };

  const updateNote = (id, text) => {
    setAppState(prev => {
      const stored = prev[id];
      let currentItems;

      if (!stored) {
        currentItems = [{ val: false, time: null }, { val: false, time: null }, { val: false, time: null }];
      } else if (Array.isArray(stored)) {
        currentItems = stored.length > 0 && typeof stored[0] === 'boolean'
          ? stored.map(b => ({ val: b, time: null }))
          : stored;
      } else {
        currentItems = stored.items;
      }

      return { ...prev, [id]: { items: currentItems, note: text } };
    });
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDangerous: false,
    confirmText: 'Confirm'
  });

  const performReset = (targetSubject) => {
    setAppState(prev => {
      const newState = { ...prev };
      Object.keys(syllabusData).forEach(subject => {
        if (targetSubject && subject !== targetSubject) return;

        Object.keys(syllabusData[subject]).forEach(category => {
          syllabusData[subject][category].forEach(topicObj => {
            const processItem = (id) => {
              // Preserve existing notes
              const currentEntry = newState[id];
              const currentNote = (currentEntry && !Array.isArray(currentEntry)) ? currentEntry.note : '';

              newState[id] = {
                items: [{ val: false, time: null }, { val: false, time: null }, { val: false, time: null }],
                note: currentNote
              };
            };

            if (topicObj.subtopics && topicObj.subtopics.length > 0) {
              topicObj.subtopics.forEach(sub => {
                processItem(generateId(subject, category, topicObj.topic, sub));
              });
            } else {
              processItem(generateId(subject, category, topicObj.topic));
            }
          });
        });
      });
      return newState;
    });
  };

  const resetProgress = (targetSubject = null) => {
    setConfirmModal({
      isOpen: true,
      title: targetSubject ? `Reset ${targetSubject}?` : 'Reset All Progress?',
      message: targetSubject
        ? `This will reset all checkboxes for ${targetSubject}. Your notes will be preserved.`
        : 'This will completely wipe your progress across all subjects. Your notes will be preserved.',
      onConfirm: () => performReset(targetSubject),
      isDangerous: true,
      confirmText: 'Yes, Reset'
    });
  };

  const stats = useMemo(() => calculateStats(appState), [appState]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar subjects={syllabusData} streak={streak} stats={stats} resetProgress={() => resetProgress()} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} subjects={syllabusData} />} />
            <Route
              path="/subject/:subjectName"
              element={
                <SubjectChecklist
                  data={syllabusData}
                  appState={appState}
                  updateTopic={updateTopic}
                  updateNote={updateNote}
                  resetProgress={resetProgress}
                  triggerConfetti={fireConfetti}
                  stats={stats}
                />
              }
            />
          </Routes>
        </main>
        <canvas id="confetti-canvas" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 100, display: 'none'
        }}></canvas>

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          isDangerous={confirmModal.isDangerous}
          confirmText={confirmModal.confirmText}
        />
      </div>
    </BrowserRouter>
  );
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  const initialState = {};
  for (const subject in syllabusData) {
    for (const category in syllabusData[subject]) {
      syllabusData[subject][category].forEach(topicObj => {
        const addId = (id) => { initialState[id] = [false, false, false]; };

        if (topicObj.subtopics && topicObj.subtopics.length > 0) {
          topicObj.subtopics.forEach(sub => addId(generateId(subject, category, topicObj.topic, sub)));
        } else {
          addId(generateId(subject, category, topicObj.topic));
        }
      });
    }
  }
  return initialState;
}

function calculateStats(state) {
  let totalItems = 0;
  let completedItems = 0;
  let totalRead = 0;
  let totalRevised = 0;
  let totalPracticed = 0;
  let totalSyllabusTopics = 0;
  const subjects = {};

  for (const subject in syllabusData) {
    let subRead = 0;
    let subRevised = 0;
    let subPracticed = 0;
    let subTotalItems = 0; // Total topics (dictating max for each stage)

    for (const category in syllabusData[subject]) {
      syllabusData[subject][category].forEach(topicObj => {
        const processId = (id) => {
          const rawEntry = state[id];
          let rawStatus;
          // Normalize entry
          if (!rawEntry) {
            rawStatus = null;
          } else if (Array.isArray(rawEntry)) {
            rawStatus = rawEntry;
          } else {
            rawStatus = rawEntry.items;
          }

          let status = [false, false, false];
          if (rawStatus) {
            status = rawStatus.map(item => {
              if (typeof item === 'boolean') return item;
              if (item && typeof item === 'object') return item.val;
              return false;
            });
          }

          subTotalItems += 1;

          if (status[0]) subRead++;
          if (status[1]) subRevised++;
          if (status[2]) subPracticed++;
        };

        if (topicObj.subtopics && topicObj.subtopics.length > 0) {
          topicObj.subtopics.forEach(sub => processId(generateId(subject, category, topicObj.topic, sub)));
        } else {
          processId(generateId(subject, category, topicObj.topic));
        }
      });
    }

    // Calculating total checkable boxes (topic * 3)
    const subTotalChecks = subTotalItems * 3;
    const subCompleteChecks = subRead + subRevised + subPracticed;

    subjects[subject] = {
      totalChecks: subTotalChecks,
      completedChecks: subCompleteChecks,
      totalTopics: subTotalItems,
      read: subRead,
      revised: subRevised,
      practiced: subPracticed,
      percent: subTotalChecks === 0 ? 0 : (subCompleteChecks / subTotalChecks) * 100
    };

    totalItems += subTotalChecks;
    completedItems += subCompleteChecks;
    totalRead += subRead;
    totalRevised += subRevised;
    totalPracticed += subPracticed;
    totalSyllabusTopics += subTotalItems;
  }
  return {
    completedItems,
    totalItems,
    totalRead,
    totalRevised,
    totalPracticed,
    totalSyllabusTopics,
    totalPercent: totalItems === 0 ? 0 : (completedItems / totalItems) * 100,
    subjects
  };
}

export default App;
