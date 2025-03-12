import { NextPage } from "next";

const ErrorPage: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {statusCode ? `${statusCode} - ` : ""}エラーが発生しました
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          申し訳ありませんが、問題が発生しました
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
