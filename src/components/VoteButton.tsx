'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/auth-context'
import { motion } from 'framer-motion'
import { castVote, removeVote, getUserVote, getVoteCounts } from '@/lib/firebase/votes'

interface VoteButtonProps {
  libraryId: string
  initialUpvotes?: number
  initialDownvotes?: number
  initialUserVote?: 1 | -1 | null
  locale?: 'es' | 'en'
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  libraryId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  locale = 'es',
}) => {
  const { user } = useAuth()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)
  const [showSignInHint, setShowSignInHint] = useState(false)

  // Load user's vote when user changes
  useEffect(() => {
    if (user) {
      getUserVote(user.uid, libraryId).then(vote => {
        if (vote) {
          setUserVote(vote.value)
        }
      })
    } else {
      setUserVote(null)
    }
  }, [user, libraryId])

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      setShowSignInHint(true)
      setTimeout(() => setShowSignInHint(false), 3000)
      return
    }

    setIsLoading(true)

    try {
      const userId = user.uid
      
      if (userVote === value) {
        // Remove vote
        await removeVote(userId, libraryId)
        
        // Update local state
        if (value === 1) {
          setUpvotes(Math.max(0, upvotes - 1))
        } else {
          setDownvotes(Math.max(0, downvotes - 1))
        }
        setUserVote(null)
      } else {
        // Cast vote
        await castVote(userId, libraryId, value)
        
        // Update local state
        if (userVote !== null) {
          // User changed their vote
          if (userVote === 1) {
            setUpvotes(Math.max(0, upvotes - 1))
            setDownvotes(downvotes + 1)
          } else {
            setDownvotes(Math.max(0, downvotes - 1))
            setUpvotes(upvotes + 1)
          }
        } else {
          // User cast a new vote
          if (value === 1) {
            setUpvotes(upvotes + 1)
          } else {
            setDownvotes(downvotes + 1)
          }
        }
        setUserVote(value)
      }
    } catch (error) {
      console.error('Vote error:', error)
      // Refresh vote counts on error
      const counts = await getVoteCounts(libraryId)
      setUpvotes(counts.upvotes)
      setDownvotes(counts.downvotes)
    } finally {
      setIsLoading(false)
    }
  }

  const totalVotes = upvotes - downvotes
  const votingDisabled = !user || isLoading

  return (
    <div className="flex flex-col gap-2">
      {/* Vote Buttons */}
      <div className="flex items-center gap-2">
        {/* Upvote Button */}
        <motion.button
          onClick={() => handleVote(1)}
          disabled={votingDisabled}
          whileHover={!votingDisabled ? { scale: 1.1 } : {}}
          whileTap={!votingDisabled ? { scale: 0.95 } : {}}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
            userVote === 1
              ? 'bg-green-100 text-green-700 border-2 border-green-400'
              : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-green-50'
          } ${votingDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={votingDisabled ? (locale === 'es' ? 'Inicia sesión para votar' : 'Sign in to vote') : ''}
        >
          <span className="text-lg">👍</span>
          <span className="text-sm">{upvotes}</span>
        </motion.button>

        {/* Downvote Button */}
        <motion.button
          onClick={() => handleVote(-1)}
          disabled={votingDisabled}
          whileHover={!votingDisabled ? { scale: 1.1 } : {}}
          whileTap={!votingDisabled ? { scale: 0.95 } : {}}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
            userVote === -1
              ? 'bg-red-100 text-red-700 border-2 border-red-400'
              : 'bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-red-50'
          } ${votingDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={votingDisabled ? (locale === 'es' ? 'Inicia sesión para votar' : 'Sign in to vote') : ''}
        >
          <span className="text-lg">👎</span>
          <span className="text-sm">{downvotes}</span>
        </motion.button>

        {/* Total Score */}
        <div className="ml-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className={`font-bold ${totalVotes > 0 ? 'text-green-600' : totalVotes < 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {totalVotes > 0 ? '+' : ''}{totalVotes}
          </span>
        </div>
      </div>

      {/* Sign In Hint */}
      {showSignInHint && !user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
        >
          <span className="text-sm text-blue-700">
            {locale === 'es'
              ? '👆 Inicia sesión en el menú superior para votar'
              : '👆 Sign in from the menu above to vote'}
          </span>
        </motion.div>
      )}

      {/* Authenticated State Message */}
      {user && userVote === null && (
        <p className="text-xs text-slate-500 text-center">
          {locale === 'es'
            ? '¿Esta librería es útil?'
            : 'Is this library useful?'}
        </p>
      )}

      {/* Your Vote Message */}
      {user && userVote !== null && (
        <p className="text-xs text-green-600 text-center font-medium">
          {locale === 'es'
            ? userVote === 1
              ? '✓ Tu voto positivo está registrado'
              : '✓ Tu voto negativo está registrado'
            : userVote === 1
            ? '✓ Your upvote is recorded'
            : '✓ Your downvote is recorded'}
        </p>
      )}
    </div>
  )
}

export default VoteButton
