// seed-admin.js
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

//  service_role key untuk bypass RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Hanya untuk server-side
)

async function createAdminUser() {
  const email = 'admin@example.com'
  const password = 'StrongPassword123!'
  const fullName = 'System Administrator'

  try {
  
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, 
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    const userId = authData.user.id


    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        created_at: new Date().toISOString()
      })

    if (profileError && !profileError.message.includes('duplicate key')) {
      console.error('Error creating profile:', profileError)
    }


    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        created_at: new Date().toISOString()
      })

    if (roleError) {
      console.error('Error adding admin role:', roleError)
    } else {
      console.log('✅ Admin user created successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      console.log('Please change the password after first login.')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()