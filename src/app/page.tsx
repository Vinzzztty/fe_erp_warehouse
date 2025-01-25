import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div>
            <h1 className="text-center">Welcome to ERP Warehouse!</h1>
            <p className="text-center">
                Manage your inventory and orders efficiently!
            </p>
        </div>
    );
}
