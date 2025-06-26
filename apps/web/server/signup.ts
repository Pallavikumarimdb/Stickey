'use server'

import client from '@repo/db/client'
import bcrypt from 'bcrypt'
import { SignUpFormSchema } from '@repo/types/types'


export async function signup(values: typeof SignUpFormSchema) {

    const Userdata = SignUpFormSchema.safeParse(values)

    if (!Userdata.success) {
        throw new Error(Userdata.error.message)
    }

    const { email, password, name } = Userdata.data

    const userExist = await client.user.findFirst({
        where: {
            OR: [{ email: email }]

        }
    })

    if (userExist) {
        return ('User already exist')
    }

    try {
        const user = await client.user.create({
            data: {
                email: email,
                password: await bcrypt.hash(password, 10),
                name: name
            }
        })
        
        return {
            success: true,
            user,
            message : "User registered successfully"
        }
    } catch (e) {
        return {
            success: false,
            error: "An unexpected error occurred during registration. Please try again."
        };
    }
}

