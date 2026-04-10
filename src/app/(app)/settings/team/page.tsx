'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, Crown, Shield, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface TeamMemberUser { id: string; name: string; email: string }
interface TeamMember { id: string; role: string; user: TeamMemberUser }
interface Team { id: string; name: string; members: TeamMember[] }

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  OWNER: { label: 'Owner', icon: Crown, color: 'hsl(38 92% 50%)' },
  ADMIN: { label: 'Admin', icon: Shield, color: '#7B61FF' },
  MEMBER: { label: 'Member', icon: User, color: 'hsl(199 89% 48%)' },
  VIEWER: { label: 'Viewer', icon: Eye, color: 'rgba(255,255,255,0.4)' },
}

export default function TeamSettingsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [showNewTeam, setShowNewTeam] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [inviteTeamId, setInviteTeamId] = useState('')
  const [inviting, setInviting] = useState(false)

  async function fetchTeams() {
    const data = await fetch('/api/team').then(r => r.json())
    setTeams(data.teams ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTeams() }, [])

  async function createTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!newTeamName.trim()) return
    setCreatingTeam(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      })
      if (!res.ok) throw new Error()
      toast.success('Team created!')
      setNewTeamName('')
      setShowNewTeam(false)
      fetchTeams()
    } catch { toast.error('Failed to create team') }
    finally { setCreatingTeam(false) }
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail || !inviteTeamId) return
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: inviteTeamId, email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to invite'); return }
      toast.success(`${inviteEmail} added to team`)
      setInviteEmail('')
      fetchTeams()
    } catch { toast.error('Failed to invite') }
    finally { setInviting(false) }
  }

  async function removeMember(teamId: string, userId: string) {
    if (!confirm('Remove this member?')) return
    const res = await fetch('/api/team/invite', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, userId }),
    })
    if (res.ok) { toast.success('Member removed'); fetchTeams() }
    else toast.error('Failed to remove')
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Team Management</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Create teams and invite collaborators</p>
        </div>
        <Button onClick={() => setShowNewTeam(!showNewTeam)} className="gap-2 text-white text-xs h-8" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
          <Plus className="w-3.5 h-3.5" /> New Team
        </Button>
      </div>

      {showNewTeam && (
        <form onSubmit={createTeam} className="flex gap-3" >
          <input required placeholder="Team name..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
          <Button type="submit" disabled={creatingTeam} className="text-white text-xs h-9 px-4" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            {creatingTeam ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowNewTeam(false)} className="text-xs h-9 px-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Cancel</Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Users className="w-8 h-8 mb-2 opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-sm text-white font-medium">No teams yet</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Create a team to collaborate with others</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{team.name}</h3>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {team.members.map(member => {
                  const cfg = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER
                  const Icon = cfg.icon
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `${cfg.color}30` }}>
                        {member.user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{member.user.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{member.user.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: cfg.color }}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </div>
                      {member.role !== 'OWNER' && (
                        <button onClick={() => removeMember(team.id, member.user.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors ml-1">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'hsl(0 84% 60%)' }} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Invite Form */}
              <form onSubmit={(e) => { setInviteTeamId(team.id); inviteMember(e) }} className="flex gap-2 pt-1">
                <input required placeholder="Email to invite..." value={inviteTeamId === team.id ? inviteEmail : ''} onChange={e => { setInviteTeamId(team.id); setInviteEmail(e.target.value) }}
                  className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none" style={inputStyle} />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="px-2 py-1.5 rounded-xl text-sm outline-none" style={inputStyle}>
                  {['ADMIN', 'MEMBER', 'VIEWER'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button type="submit" disabled={inviting} className="text-white text-xs h-8 px-3" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
                  Invite
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
