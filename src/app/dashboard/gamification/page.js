'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { apiFetch } from '@/lib/api';

export default function GamificationPage() {
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [profileRes, challengesRes, leaderboardRes] = await Promise.all([
          apiFetch('/gamification/profile'),
          apiFetch('/gamification/challenges'),
          apiFetch('/gamification/leaderboard'),
        ]);
console.log(profileRes.data);

        setProfile(profileRes.data);
        setChallenges(challengesRes.data.challenges || []);
        setLeaderboardData(leaderboardRes.data);
      } catch (error) {
        console.error('Failed to fetch gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Gamification Data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Gamification Profile</h1>
        <p className={styles.subtitle}>Complete challenges, maintain streaks, and climb the league!</p>
      </div>

      <div className={styles.profileGrid}>
        <div className={`${styles.glassPanel} ${styles.statCard}`}>
          <div className={styles.statIcon}>🏅</div>
          <div className={styles.statValue}>{profile?.level || 'Bronze'}</div>
          <div className={styles.statLabel}>Current League</div>
        </div>
        <div className={`${styles.glassPanel} ${styles.statCard}`}>
          <div className={styles.statIcon}>🪙</div>
          <div className={styles.statValue}>{profile?.coins || 0}</div>
          <div className={styles.statLabel}>League Coins</div>
        </div>
        <div className={`${styles.glassPanel} ${styles.statCard}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>{profile?.lifetimeCoins || 0}</div>
          <div className={styles.statLabel}>Lifetime Coins</div>
        </div>
        <div className={`${styles.glassPanel} ${styles.statCard}`}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue}>{profile?.currentStreak || 0}</div>
          <div className={styles.statLabel}>Current Streak</div>
        </div>
        <div className={`${styles.glassPanel} ${styles.statCard}`}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statValue}>{profile?.longestStreak || 0}</div>
          <div className={styles.statLabel}>Longest Streak</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Daily Challenges */}
        <section className={styles.glassPanel}>
          <h2 className={styles.sectionTitle}>
            <span>🎯</span> Daily Challenges
          </h2>
          <div className={styles.challengesList}>
            {challenges.map((challenge, idx) => {
              const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);
              return (
                <div key={idx} className={`${styles.challengeItem} ${challenge.completed ? styles.completed : ''}`}>
                  <div className={styles.challengeHeader}>
                    <span className={styles.challengeLabel}>
                      {challenge.completed ? '✅ ' : ''}{challenge.label}
                    </span>
                    <span className={styles.challengeReward}>
                      +{challenge.coins || 25} 🪙
                    </span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <div className={styles.progressText}>
                    {challenge.progress} / {challenge.target}
                  </div>
                </div>
              );
            })}
            {challenges.length === 0 && <p>No active challenges today.</p>}
          </div>
        </section>

        {/* Leaderboard */}
        <section className={styles.glassPanel}>
          <h2 className={styles.sectionTitle}>
            <span>🏆</span> League Leaderboard
            {leaderboardData?.level && (
              <span className={`${styles.leagueBadge} ${styles[`league_${leaderboardData.level.toLowerCase()}`]}`}>
                {leaderboardData.level}
              </span>
            )}
          </h2>
          
          <div className={styles.tableContainer}>
            {leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <table className={styles.leaderboardTable}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Coins</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.leaderboard.map((entry, idx) => {
                    let rowClass = styles.stayRow;
                    let statusText = '-';
                    
                    if (idx < 6) {
                      rowClass = styles.promoteRow;
                      statusText = '⬆️ Promotion Zone';
                    } else if (idx >= 20) {
                      rowClass = styles.demoteRow;
                      statusText = '⬇️ Demotion Zone';
                    }

                    return (
                      <tr key={idx} className={`${styles.leaderboardRow} ${rowClass}`}>
                        <td className={styles.rankCell}>#{entry.rank}</td>
                        <td className={styles.userCell}>
                          <div className={styles.avatar}>
                            {entry.user?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className={styles.username}>{entry.user?.username || 'Unknown User'}</span>
                        </td>
                        <td className={styles.coinsCell}>{entry.coins}</td>
                        <td style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{statusText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#a0aec0', padding: '1rem' }}>No leaderboard data available yet. Be the first to join!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
