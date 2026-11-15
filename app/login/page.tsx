import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">ログイン / 新規登録</h1>

      <form className="flex flex-col gap-3 w-72">
        <label htmlFor="email">メールアドレス</label>
        <input
          name="email"
          id="email"
          type="email"
          required
          className="border rounded px-3 py-2 text-black"
        />

        <label htmlFor="password">パスワード</label>
        <input
          name="password"
          id="password"
          type="password"
          required
          className="border rounded px-3 py-2 text-black"
        />

        <button
          formAction={login}
          className="bg-blue-500 text-white rounded px-4 py-2 mt-2"
        >
          ログイン
        </button>
        <button
          formAction={signup}
          className="bg-gray-500 text-white rounded px-4 py-2"
        >
          新規登録
        </button>

        {params?.message && (
          <p className="text-center text-sm text-red-500 mt-2">
            {params.message}
          </p>
        )}
      </form>
    </main>
  );
}