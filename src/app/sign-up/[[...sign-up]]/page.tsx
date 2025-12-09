import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-linear-to-br from-blue-50 via-white to-purple-50 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>

      {/* 注册框容器 */}
      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'shadow-2xl',
              card: 'shadow-2xl',
            },
          }}
        />
      </div>
    </div>
  )
}
