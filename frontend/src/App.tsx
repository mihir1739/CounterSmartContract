import { useEffect, useState } from "react";
import { Layout, Row, Col, Table} from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Provider, Network } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "./App.css";
interface User {
  name: string;
  score: number;
}

function App() {
  const provider = new Provider(Network.DEVNET);
  const { account } = useWallet();
  const [users, setUsers] = useState<User[]>([]);
  const [accountHasCounter, setAccountHasCounter] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const moduleAddress = "0x7e94dcde73c5fae22ffe1519c0f374b540c7fcb641110e3a9be7d87adc0853ff";
  const columns = [
    {
      title: 'Address',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    }];
  const fetchCounter = async () => {
    if (!account) return [];
    // change this to be your module account address
    try {
      await provider.getAccountResource(
        account.address,
        `${moduleAddress}::counter::UserCounter`
      );
      setAccountHasCounter(true);
    } catch (e: any) {
      console.log(e);
      setAccountHasCounter(false);
    }
  };
  const increment = async () => {
    if (!account) return [];
    // build a transaction payload to be submited
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::counter::increment`,
      type_arguments: [],
      arguments: [],
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await provider.waitForTransactionWithResult(response.hash);
      setCount(count + 1);
    } catch (e: any) {
      console.log(e);
    }
  };

  const getUsers = async () => {
    if (!account) return [];
    let users_temp: User[] = [];
    const payload = {
      function: `${moduleAddress}::counter::get_users`,
      type_arguments: [],
      arguments: []
    };
    try {
      let x: any = await provider.view(payload);
      x[0]['data'].map((object:any) => {
        users_temp.push({ name: String(object['key']), score: Number(object['value']) })
      });
      users_temp.sort((a, b) => b.score - a.score);
      setUsers(users_temp);
    } catch (e: any) {
      console.log(e);
    }
  };

  const addCounter = async () => {
    if (!account) return [];
    // build a transaction payload to be submited
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::counter::create_usercounter`,
      type_arguments: [],
      arguments: [],
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await provider.waitForTransaction(response.hash);
      setAccountHasCounter(true);
    } catch (e: any) {
      console.log(e);
      setAccountHasCounter(false);
    }
  };

  const getCounter = async () => {
    if (!account) return [];
    const payload = {
      function: `${moduleAddress}::counter::get_global_counter`,
      type_arguments: [],
      arguments: []
    };
    try {
      let x: any = await provider.view(payload);
      let num = Number(x[0]);
      setCount(num);
    } catch (e: any) {
      console.log(e);
      setAccountHasCounter(false);
    }
  };
  useEffect(() => {
    fetchCounter();
    getCounter();
    getUsers();
  }, [account?.address]);
  return (
    <>
      <Layout style={{ backgroundColor: "#5D548C", width: '100%' }}>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Our Counter</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "150px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <center><h1 style={{ color: 'aquamarine', fontSize: '200px' }}>{count}</h1></center>
      <div style={{ justifyContent: 'space-between', margin: "10rem", display: "flex" }}>
        <button onClick={getCounter} style={{ padding: "30px", fontSize: '30px', backgroundColor: "#45C3B8	", borderRadius: "20px", color: 'white' }}>
          Get count / Refresh Count
        </button>
        <button onClick={increment} style={{ padding: "30px", fontSize: '30px', backgroundColor: "#45C3B8", borderRadius: "20px", color: 'white' }}>
          Increment
        </button>
      </div>

      {!accountHasCounter && (
        <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
          <Col span={8} offset={8}>
            <button onClick={addCounter} style={{ padding: "30px", fontSize: '30px', backgroundColor: "#45C3B8	", borderRadius: "20px", color: 'white' }}>
              Initiate Counter
            </button>
          </Col>
        </Row>
      )}
      <div style={{ margin: "10rem" }}>
        <center><h1 style={{ fontSize: '50px' }}>Leaderboard</h1></center>
        <Table dataSource={users} columns={columns} rowKey="name"></Table>
        <center><button onClick={getUsers} style={{ padding: "30px", fontSize: '30px', backgroundColor: "#45C3B8	", borderRadius: "20px", color: 'white' }}>
          Refresh LeaderBoard
        </button></center>
      </div>
    </>
  )
}

export default App
