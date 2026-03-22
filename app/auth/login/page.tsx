export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Logo 區 */}
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Admin Night
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            找一個地方，和陌生人一起完成今天的事
          </p>
        </div>

        {/* 登入按鈕 */}
        <form action="/auth/google" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.547 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            用 Google 帳號登入
          </button>
        </form>

        <p className="text-zinc-600 text-xs text-center">
          登入即代表你同意我們的使用條款
        </p>
      </div>
    </div>
  )
}