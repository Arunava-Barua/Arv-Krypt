import {
  Navbar,
  Footer,
  Transactions,
  Services,
  Welcome,
  Loader,
} from "./component/index.js";

const App = () => {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </div>

      <Services />
      <Transactions />
      <Footer />
    </div>
  );
};

export default App;
