# app/schemas/user.py this is ussed for validation 

from pydantic import BaseModel, EmailStr, Field

# 👇 register request schema, BaseModel comes from pydantic  
class RegisterUser(BaseModel):  #when i write basemodel, i am telling pydantic that this class should becoe a validated data model
                              
    fullName: str = Field(min_length=3)

    address: str

    phone: str = Field(pattern="^[0-9]{10}$")

    email: EmailStr

    password: str = Field(min_length=8)


# 👇 login request schema
class LoginUser(BaseModel):

    email: EmailStr

    password: str

#schema for AddPassword form
# this validates the data coming from React form of AddPassword
class AddPasswordSchema(BaseModel):
    application_name: str = Field(min_length=2)
    registered_email: EmailStr
    registered_password: str =Field(min_length=6)


#schema for UpdatePassword form which is used to validate the data coming from React form of EditPassword
class UpdatePasswordSchema(BaseModel):
    application_name: str
    registered_email: EmailStr
    registered_password: str