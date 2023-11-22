module counter_addr::counter {
    use std::simple_map::{SimpleMap,Self};
    use std::signer;

    #[test_only]
    use std::account;

    const ADDR:  address = @0xfbd58ddf3ae5e6c8e05de5afad1ee018ca62759fd10799628d55944fbe8a575e;
    struct Counter has key ,store
    { 
        click_counter: u128,
        click_map : SimpleMap<address,u64>
    }
    struct UserCounter has key,store 
    {
        counter: u64
    }

    fun init_module(admin: &signer) 
    {
        move_to(admin, Counter {
            click_counter : 0,
            click_map: simple_map::new()
        });
    }

    public entry fun create_usercounter(account: &signer)
    {
        move_to(account, UserCounter {
            counter : 0,
        });
    }

    public fun resource_exists(adrs: address): bool {
        exists<Counter>(adrs)
    }

    public entry fun increment(account: &signer) acquires Counter,UserCounter
    {
        let account_address = signer::address_of(account);
        resource_exists(account_address);
        let user_counter = &mut borrow_global_mut<UserCounter>(account_address).counter;
        *user_counter = *user_counter + 1; 

        let global_counter = &mut borrow_global_mut<Counter>(ADDR).click_counter;
        *global_counter = *global_counter + 1; 
        let m_ref = &mut borrow_global_mut<Counter>(ADDR).click_map;
        if(simple_map::contains_key(m_ref,&account_address))
        {
            let v=simple_map::borrow_mut(m_ref,&account_address);
            *v=*v + 1;
        }
        else 
        {
            simple_map::add(m_ref,account_address,1);
        }

    }
    
    #[view]
    public fun get_global_counter(): u128 acquires Counter
    {
        let counter = borrow_global<Counter>(ADDR);
        counter.click_counter
    }

    #[view]
    public fun get_users() : SimpleMap<address,u64> acquires Counter 
    {
        let counter = borrow_global<Counter>(ADDR);
        counter.click_map
    }


    #[test(admin = @0xfbd58ddf3ae5e6c8e05de5afad1ee018ca62759fd10799628d55944fbe8a575e)]
    public entry fun test_flow(admin: signer) acquires Counter,UserCounter {
        let addr = @0x7;
        let acc = account::create_account_for_test(signer::address_of(&admin));
        let acc2 = account::create_account_for_test(addr);
        init_module(&acc);
        create_usercounter(&acc2);
        let ini_count = get_global_counter();
        assert!(ini_count == 0, 4);
        increment(&acc2);
        let count = get_global_counter();
        assert!(count == 1, 5);
        let map = get_users();
        let user_count = simple_map::borrow(&mut map,& addr);
        assert!(*user_count == 1, 6);
    }
}