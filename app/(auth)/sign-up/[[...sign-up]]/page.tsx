import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (

// sign=> [...sign-in]==>this is the syntax , clerk wants => so dont question!


    // Glassmorphism is used to create a modern, sleek, and visually appealing UI by mimicking the look of frosted or blurred glass.
    <div className="flex-center glassmorphism-auth h-screen w-full">
        {/* this sign in s provide by clerk !! */}
       <SignUp/>
    </div>
  )
}

export default page
