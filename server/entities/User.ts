export interface UserData {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatarKey?: string | null
  website?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialLinkedin?: string | null
  profileVisible?: boolean
  aiTone?: string | null
  aiToneCustom?: string | null
  aiExtraContext?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface UserJSON {
  clerkId?: string
  clerk_id?: string
  email: string
  firstName?: string | null
  first_name?: string | null
  lastName?: string | null
  last_name?: string | null
  role?: string
  displayName?: string | null
  display_name?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatar_url?: string | null
  avatarKey?: string | null
  avatar_key?: string | null
  website?: string | null
  socialInstagram?: string | null
  social_instagram?: string | null
  socialTwitter?: string | null
  social_twitter?: string | null
  socialLinkedin?: string | null
  social_linkedin?: string | null
  profileVisible?: boolean
  profile_visible?: boolean
  aiTone?: string | null
  ai_tone?: string | null
  aiToneCustom?: string | null
  ai_tone_custom?: string | null
  aiExtraContext?: string | null
  ai_extra_context?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class User {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  avatarKey: string | null
  website: string | null
  socialInstagram: string | null
  socialTwitter: string | null
  socialLinkedin: string | null
  profileVisible: boolean
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ clerkId, email, firstName, lastName, role, displayName, bio, avatarUrl, avatarKey, website, socialInstagram, socialTwitter, socialLinkedin, profileVisible, aiTone, aiToneCustom, aiExtraContext, createdAt, updatedAt }: UserData) {
    this.clerkId = clerkId
    this.email = email
    this.firstName = firstName || null
    this.lastName = lastName || null
    this.role = role || 'user'
    this.displayName = displayName || null
    this.bio = bio || null
    this.avatarUrl = avatarUrl || null
    this.avatarKey = avatarKey || null
    this.website = website || null
    this.socialInstagram = socialInstagram || null
    this.socialTwitter = socialTwitter || null
    this.socialLinkedin = socialLinkedin || null
    this.profileVisible = profileVisible ?? true
    this.aiTone = aiTone || null
    this.aiToneCustom = aiToneCustom || null
    this.aiExtraContext = aiExtraContext || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  get fullDisplayName(): string {
    return this.displayName || [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email
  }

  static fromJSON(data: UserJSON): User {
    return new User({
      clerkId: (data.clerkId || data.clerk_id)!,
      email: data.email,
      firstName: data.firstName || data.first_name || null,
      lastName: data.lastName || data.last_name || null,
      role: data.role || 'user',
      displayName: data.displayName ?? data.display_name ?? null,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? data.avatar_url ?? null,
      avatarKey: data.avatarKey ?? data.avatar_key ?? null,
      website: data.website ?? null,
      socialInstagram: data.socialInstagram ?? data.social_instagram ?? null,
      socialTwitter: data.socialTwitter ?? data.social_twitter ?? null,
      socialLinkedin: data.socialLinkedin ?? data.social_linkedin ?? null,
      profileVisible: data.profileVisible ?? data.profile_visible ?? true,
      aiTone: data.aiTone ?? data.ai_tone ?? null,
      aiToneCustom: data.aiToneCustom ?? data.ai_tone_custom ?? null,
      aiExtraContext: data.aiExtraContext ?? data.ai_extra_context ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): UserData {
    return {
      clerkId: this.clerkId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      displayName: this.displayName,
      bio: this.bio,
      avatarUrl: this.avatarUrl,
      avatarKey: this.avatarKey,
      website: this.website,
      socialInstagram: this.socialInstagram,
      socialTwitter: this.socialTwitter,
      socialLinkedin: this.socialLinkedin,
      profileVisible: this.profileVisible,
      aiTone: this.aiTone,
      aiToneCustom: this.aiToneCustom,
      aiExtraContext: this.aiExtraContext,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
