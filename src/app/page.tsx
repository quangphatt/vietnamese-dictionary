import { Suspense } from "react";
import Home from "@/views/home";
import { Loading } from "@/components/Loading";

const HomePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
};

export default HomePage;
