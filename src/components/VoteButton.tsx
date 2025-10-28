'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/firebase/auth-context'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
  const { user, firebaseUser } = useAuth()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)
  const [showSignInHint, setShowSignInHint] = useState(false)

  const handleVote = async (value: 1 | -1) => {
    if (!firebaseUser) {
      setShowSignInHint(true)
      setTimeout(() => setShowSignInHint(false), 3000)
      return
    }

    setIsLoading(true)

    try {
      const idToken = await firebaseUser.getIdToken()
      
      if (userVote === value) {
        const response = await fetch(`/api/votes/${libraryId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
        })

        if (!response.ok) {
          throw new Error('Failed to remove vote')
        }

        // Update local state
        if (value === 1) {
          setUpvotes(Math.max(0, upvotes - 1))
        } else {
          setDownvotes(Math.max(0, downvotes - 1))
        }
        setUserVote(null)
      } else {
        const idToken = await firebaseUser.getIdToken()
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            libraryId,
            value,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to cast vote')
        }

        const data = await response.json()

        // Update local state
        setUpvotes(data.counts.upvotes)
        setDownvotes(data.counts.downvotes)
        setUserVote(value)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalVotes = upvotes - downvotes
  const votingDisabled = !firebaseUser || isLoading

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
      {showSignInHint && !session?.user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
        >
          <span className="text-sm text-blue-700">
            {locale === 'es'
              ? 'Inicia sesión para votar en esta librería'
              : 'Sign in to vote on this library'}
          </span>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            {locale === 'es' ? 'Iniciar sesión' : 'Sign in'}
          </Link>
        </motion.div>
      )}

      {/* Unauthenticated State Message */}
      {!session?.user && !showSignInHint && (
        <p className="text-xs text-slate-500 text-center">
          {locale === 'es'
            ? 'Inicia sesión para votar'
            : 'Sign in to vote'}
        </p>
      )}

      {/* Authenticated State Message */}
      {session?.user && userVote === null && (
        <p className="text-xs text-slate-500 text-center">
          {locale === 'es'
            ? 'Se el primero en votar'
            : 'Be the first to vote'}
        </p>
      )}

      {/* Your Vote Message */}
      {session?.user && userVote !== null && (
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
