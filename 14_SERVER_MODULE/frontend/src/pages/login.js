import api from "../libs/api";
import { useState } from "react"

function Login() {
    // const [isError, setIsError] = useState(false)
    // const handleLogin = async () => {
    //     const formData = new FormData();
    // }
    return (

        <main>
            <header class="jumbotron">
                <div class="container text-center">
                    <h1 class="display-4">Installment Cars</h1>
                </div>
            </header>

            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form class="card card-default">
                            <div class="card-header">
                                <h4 class="mb-0">Login</h4>
                            </div>
                            <div class="card-body">
                                <form  >
                                    <div class="form-group row align-items-center">
                                        <div class="col-4 text-right">ID Card Number</div>
                                        <div class="col-8"><input type="text" name="cardNumber" class="form-control" /></div>
                                    </div>
                                    <div class="form-group row align-items-center">
                                        <div class="col-4 text-right">Password</div>
                                        <div class="col-8"><input type="password" name="password" class="form-control" /></div>
                                    </div>
                                    <div class="form-group row align-items-center mt-4">
                                        <div class="col-4"></div>
                                        <div class="col-8"><a href="/dashboard" class="btn btn-primary">Login</a></div>
                                    </div>
                                </form>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login;