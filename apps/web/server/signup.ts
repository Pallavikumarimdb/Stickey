'use server'

import client from '@repo/db/client'
import bcrypt from 'bcrypt'
import { SignUpFormSchema } from '@repo/types/types'
import { z } from "zod"

type SignUpInput = z.infer<typeof SignUpFormSchema>

export async function SignUp(values: SignUpInput) {
  const parsed = SignUpFormSchema.safeParse(values)

  if (!parsed.success) {
    return { success: false, error: "Invalid input. Please check all fields." }
  }

  const { email, password, name } = parsed.data

  try {
    const userExists = await client.user.findUnique({
      where: { email }
    })

    if (userExists) {
      return {
        success: false,
        error: "An account with this email already exists."
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await client.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })

    return {
      success: true,
      user,
      message: "User registered successfully"
    }
  } catch (err) {
    console.error("Signup Error:", err)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }
  }
}
